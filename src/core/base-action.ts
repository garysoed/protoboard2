import { Vine } from '@grapevine';
import { Errors } from '@gs-tools/error';
import { mapNonNull } from '@gs-tools/rxjs';
import { Converter } from '@nabu';
import { element, InitFn, mutationObservable, onDom } from '@persona';
import { BehaviorSubject, combineLatest, EMPTY, fromEvent, merge, Observable } from '@rxjs';
import { filter, map, mapTo, startWith, switchMap, tap } from '@rxjs/operators';

import { TriggerParser } from './trigger-parser';
import { TriggerSpec, TriggerType } from './trigger-spec';


const $ = {
  host: element({
    click: onDom('click'),
    mouseout: onDom('mouseout'),
    mouseover: onDom('mouseover'),
  }),
};

type ConverterOf<O> = {
  [K in keyof O]: Converter<O[K], string>;
};

type TriggerConfig = {trigger: TriggerSpec};

const TRIGGER_CONVERTER = new TriggerParser();

export abstract class BaseAction<I = {}> {
  readonly triggerSpec$: BehaviorSubject<TriggerSpec>;
  private readonly appendedActionConfigConverters: ConverterOf<I> & ConverterOf<TriggerConfig>;

  constructor(
      private readonly actionKey: string,
      readonly actionName: string,
      actionConfigConverters: ConverterOf<I>,
      defaultTriggerSpec: TriggerSpec,
  ) {
    this.appendedActionConfigConverters = {
      ...actionConfigConverters,
      trigger: TRIGGER_CONVERTER as Converter<TriggerSpec, string>,
    };
    this.triggerSpec$ = new BehaviorSubject(defaultTriggerSpec);
  }

  install(): InitFn {
    return (vine, root) => {
      const element = root.host;
      if (!(element instanceof HTMLElement)) {
        throw Errors.assert('element').shouldBeAnInstanceOf(HTMLElement).butWas(element);
      }

      return combineLatest([
        this.setupTrigger(vine, root),
        this.setupConfig(vine, root),
      ]);
    };
  }

  protected abstract onConfig(config$: Observable<Partial<I>>):
      Observable<unknown>;

  protected abstract onTrigger(vine: Vine, root: ShadowRoot): Observable<unknown>;

  private setupConfig(_: Vine, root: ShadowRoot): Observable<unknown> {
    return mutationObservable(
        root.host,
        {
          childList: true,
          attributes: true,
          subtree: true,
        })
        .pipe(
            startWith({}),
            map(() => {
              return root.host.querySelector(`pb-action-config[action="${this.actionKey}"]`);
            }),
            mapNonNull(configEl => {
              const config: Partial<I & TriggerConfig> = {};
              const keys = Object.keys(this.appendedActionConfigConverters) as
                  Array<keyof I & 'trigger'>;
              for (const key of keys) {
                const parseResult = this.appendedActionConfigConverters[key]
                    .convertBackward(configEl.getAttribute(key) || '');
                if (parseResult.success) {
                  // TODO: Fix this typing.
                  config[key] = parseResult.result as any;
                }
              }

              return config;
            }),
            map(config => (config || {}) as Partial<I & TriggerConfig>),
            tap(config => {
              if (config.trigger) {
                this.triggerSpec$.next(config.trigger as TriggerSpec);
              }
            }),
            this.onConfig.bind(this),
        );
  }

  private setupTrigger(vine: Vine, root: ShadowRoot): Observable<unknown> {
    return this.triggerSpec$
        .pipe(
            switchMap(spec => {
              switch (spec.type) {
                case TriggerType.CLICK:
                  return this.setupTriggerClick(root);
                case TriggerType.KEY:
                  return this.setupTriggerKey(root, spec.key);
              }
            }),
            switchMap(() => this.onTrigger(vine, root)),
        );
  }

  private setupTriggerClick(root: ShadowRoot): Observable<unknown> {
    return $.host._.click.getValue(root);
  }

  private setupTriggerKey(root: ShadowRoot, specKey: string): Observable<unknown> {
    return merge(
        $.host._.mouseout.getValue(root).pipe(mapTo(false)),
        $.host._.mouseover.getValue(root).pipe(mapTo(true)),
    )
    .pipe(
        switchMap(hovered => {
          return hovered ? fromEvent<KeyboardEvent>(window, 'keydown') : EMPTY;
        }),
        map(event => event.key),
        filter(key => key === specKey),
    );
  }
}

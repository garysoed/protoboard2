import { Vine } from 'grapevine';
import { cache } from 'gs-tools/export/data';
import { mapNonNull, switchMapNonNull } from 'gs-tools/export/rxjs';
import { Converter } from 'nabu';
import { element, mutationObservable, onDom } from 'persona';
import { BehaviorSubject, EMPTY, fromEvent, merge, Observable, Subject } from 'rxjs';
import { filter, map, mapTo, startWith, switchMap, tap } from 'rxjs/operators';

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
  private readonly appendedActionConfigConverters: ConverterOf<I> & ConverterOf<TriggerConfig>;
  private readonly onTriggerFunction$ = new Subject<void>();
  readonly triggerSpec$: BehaviorSubject<TriggerSpec>;

  constructor(
      readonly key: string,
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

  install(shadowRoot: ShadowRoot, vine: Vine): Observable<unknown> {
    return merge(...this.getSetupObs(shadowRoot, vine));
  }

  protected getSetupObs(shadowRoot: ShadowRoot, vine: Vine): ReadonlyArray<Observable<unknown>> {
    return [
      this.setupHandleTrigger(this.createOnTrigger(shadowRoot), vine, shadowRoot),
      this.setupTriggerFunction(shadowRoot),
      this.setupConfig(shadowRoot),
    ];
  }

  protected abstract onConfig(config$: Observable<Partial<I>>): Observable<unknown>;

  protected abstract setupHandleTrigger(
      trigger$: Observable<unknown>,
      vine: Vine,
      root: ShadowRoot,
  ): Observable<unknown>;

  @cache()
  private createOnTrigger(root: ShadowRoot): Observable<unknown> {
    const userTrigger$ = this.triggerSpec$
        .pipe(
            switchMap(spec => {
              switch (spec.type) {
                case TriggerType.CLICK:
                  return this.createTriggerClick(root);
                case TriggerType.KEY:
                  return this.createTriggerKey(root, spec.key);
              }
            }),
        );

    return merge(userTrigger$, this.onTriggerFunction$);
  }

  private createTriggerClick(root: ShadowRoot): Observable<unknown> {
    return $.host._.click.getValue(root);
  }

  private createTriggerKey(root: ShadowRoot, specKey: string): Observable<unknown> {
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

  private setupConfig(root: ShadowRoot): Observable<unknown> {
    return mutationObservable(
        root.host,
        {
          childList: true,
          subtree: true,
        })
        .pipe(
            startWith({}),
            map(() => {
              return root.host.querySelector(`pb-action-config[action="${this.key}"]`);
            }),
            switchMapNonNull(configEl => {
              return mutationObservable(
                  configEl,
                  {
                    attributes: true,
                    attributeFilter: Object.keys(this.appendedActionConfigConverters),
                  })
                  .pipe(startWith({}), mapTo(configEl));
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
            config$ => this.onConfig(config$),
        );
  }

  private setupTriggerFunction(root: ShadowRoot): Observable<unknown> {
    return $.host.getValue(root).pipe(
        tap(hostEl => {
          (hostEl as any)[this.key] = () => {
            this.onTriggerFunction$.next();
          };
        }),
    );
  }
}

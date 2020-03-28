import { Vine } from 'grapevine';
import { cache } from 'gs-tools/export/data';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { mapNonNull, switchMapNonNull } from 'gs-tools/export/rxjs';
import { Converter } from 'nabu';
import { element, mutationObservable, onDom, PersonaContext } from 'persona';
import { BehaviorSubject, EMPTY, fromEvent, merge, Observable, Subject } from 'rxjs';
import { filter, map, mapTo, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';

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

export abstract class BaseAction<C = {}> extends BaseDisposable {
  private readonly appendedActionConfigConverters: ConverterOf<C> & ConverterOf<TriggerConfig>;

  private readonly onTriggerFunction$ = new Subject<void>();

  constructor(
      readonly key: string,
      readonly actionName: string,
      actionConfigConverters: ConverterOf<C>,
      private readonly defaultTriggerSpec: TriggerSpec,
      private readonly context: PersonaContext,
  ) {
    super();
    this.appendedActionConfigConverters = {
      ...actionConfigConverters,
      trigger: TRIGGER_CONVERTER as Converter<TriggerSpec, string>,
    };

    this.setupTriggerFunction();
  }

  protected get shadowRoot(): ShadowRoot {
    return this.context.shadowRoot;
  }

  @cache()
  private get triggerSpec_$(): BehaviorSubject<TriggerSpec> {
    return new BehaviorSubject(this.defaultTriggerSpec);
  }

  get triggerSpec$(): Observable<TriggerSpec> {
    return this.triggerSpec_$;
  }

  protected get vine(): Vine {
    return this.context.vine;
  }

  @cache()
  protected get config$(): Observable<Partial<C & TriggerConfig>> {
    return mutationObservable(
        this.shadowRoot.host,
        {
          childList: true,
          subtree: true,
        })
        .pipe(
            startWith({}),
            map(() => {
              return this.shadowRoot.host.querySelector(`pb-action-config[action="${this.key}"]`);
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
              const config: Partial<C & TriggerConfig> = {};
              const keys = Object.keys(this.appendedActionConfigConverters) as
                  Array<keyof C & 'trigger'>;
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
            map(config => (config || {}) as Partial<C & TriggerConfig>),
            tap(config => {
              if (config.trigger) {
                this.triggerSpec_$.next(config.trigger as TriggerSpec);
              }
            }),
        );
  }

  @cache()
  protected get onTrigger$(): Observable<unknown> {
    const userTrigger$ = this.triggerSpec$
        .pipe(
            switchMap(spec => {
              switch (spec.type) {
                case TriggerType.CLICK:
                  return this.createTriggerClick(this.shadowRoot);
                case TriggerType.KEY:
                  return this.createTriggerKey(this.shadowRoot, spec.key);
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

  private setupTriggerFunction(): void {
    $.host.getValue(this.shadowRoot)
        .pipe(takeUntil(this.onDispose$))
        .subscribe(hostEl => {
          (hostEl as any)[this.key] = () => {
            this.onTriggerFunction$.next();
          };
        });
  }
}

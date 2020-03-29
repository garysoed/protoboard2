import { Vine } from 'grapevine';
import { cache } from 'gs-tools/export/data';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { mapNonNull, switchMapNonNull } from 'gs-tools/export/rxjs';
import { Converter } from 'nabu';
import { element, mutationObservable, onDom } from 'persona';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { map, mapTo, startWith, switchMap, takeUntil } from 'rxjs/operators';


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

export abstract class BaseAction<C = {}> extends BaseDisposable {
  protected readonly actionTarget$ = new ReplaySubject<ShadowRoot>(1);
  private readonly onTriggerFunction$ = new Subject<void>();

  constructor(
      readonly key: string,
      readonly actionName: string,
      private readonly actionConfigConverters: ConverterOf<C>,
      protected readonly vine: Vine,
  ) {
    super();

    this.setupTriggerFunction();
  }

  setActionTarget(shadowRoot: ShadowRoot): void {
    this.actionTarget$.next(shadowRoot);
  }

  trigger(): void {
    this.onTriggerFunction$.next();
  }

  @cache()
  get config$(): Observable<Partial<C>> {
    return this.actionTarget$.pipe(
        switchMap(shadowRoot => {
          return mutationObservable(shadowRoot.host, {childList: true, subtree: true})
              .pipe(
                  mapTo(shadowRoot),
                  startWith(shadowRoot),
              );
        }),
        map(shadowRoot => {
          return shadowRoot.host.querySelector(`pb-action-config[action="${this.key}"]`);
        }),
        switchMapNonNull(configEl => {
          return mutationObservable(
              configEl,
              {
                attributes: true,
                attributeFilter: Object.keys(this.actionConfigConverters),
              })
              .pipe(startWith({}), mapTo(configEl));
        }),
        mapNonNull(configEl => {
          const config: Partial<C> = {};
          const keys = Object.keys(this.actionConfigConverters) as
              Array<keyof C & 'trigger'>;
          for (const key of keys) {
            const parseResult = this.actionConfigConverters[key]
                .convertBackward(configEl.getAttribute(key) || '');
            if (parseResult.success) {
              // TODO: Fix this typing.
              config[key] = parseResult.result as any;
            }
          }

          return config;
        }),
        map(config => config || {}),
    );
  }

  @cache()
  get onTrigger$(): Observable<unknown> {
    return this.onTriggerFunction$;
  }

  private setupTriggerFunction(): void {
    this.actionTarget$
        .pipe(
            switchMap(shadowRoot => $.host.getValue(shadowRoot)),
            takeUntil(this.onDispose$),
        )
        .subscribe(hostEl => {
          (hostEl as any)[this.key] = () => {
            this.trigger();
          };
        });
  }
}

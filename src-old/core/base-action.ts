import { Vine } from 'grapevine';
import { cache } from 'gs-tools/export/data';
import { mapNonNull, Runnable, switchMapNonNull } from 'gs-tools/export/rxjs';
import { Converter } from 'nabu';
import { host, mutationObservable, PersonaContext } from 'persona';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { map, mapTo, startWith, switchMap } from 'rxjs/operators';


type ConverterOf<O> = {
  [K in keyof O]: Converter<O[K], string>;
};

export abstract class BaseAction<C = {}> extends Runnable {
  protected readonly actionContext$ = new ReplaySubject<PersonaContext>(1);
  readonly #onTrigger$ = new Subject<void>();

  constructor(
      readonly key: string,
      readonly actionName: string,
      private readonly actionConfigConverters: ConverterOf<C>,
      protected readonly vine: Vine,
  ) {
    super();
  }

  setActionContext(context: PersonaContext): void {
    this.actionContext$.next(context);
  }

  trigger(): void {
    this.#onTrigger$.next();
  }

  @cache()
  get config$(): Observable<Partial<C>> {
    return this.actionContext$.pipe(
        switchMap(({shadowRoot}) => {
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
  get host$(): Observable<Element> {
    return this.actionContext$.pipe(switchMap(context => host({}).getValue(context)));
  }

  get onTrigger$(): Observable<unknown> {
    return this.#onTrigger$;
  }
}

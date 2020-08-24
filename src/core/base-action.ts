import { cache } from 'gs-tools/export/data';
import { assertDefined, mapNonNull, Runnable, switchMapNonNull } from 'gs-tools/export/rxjs';
import { Converter } from 'nabu';
import { attributeIn, host, mutationObservable, onMutation, PersonaContext, stringParser } from 'persona';
import { Observable, of as observableOf, Subject, throwError } from 'rxjs';
import { map, mapTo, startWith, switchMap } from 'rxjs/operators';


type ConverterOf<O> = {
  readonly [K in keyof O]: Converter<O[K], string>;
};

export const $baseActionApi = {
  objectId: attributeIn('object-id', stringParser()),
};

const $ = {
  host: host({
    ...$baseActionApi,
    onMutation: onMutation({childList: true, subtree: true}),
  }),
};

export abstract class BaseAction<C = {}> extends Runnable {
  readonly #onTrigger$ = new Subject<void>();

  constructor(
      readonly key: string,
      readonly actionName: string,
      private readonly actionConfigConverters: ConverterOf<C>,
      protected readonly context: PersonaContext,
  ) {
    super();
  }

  trigger(): void {
    this.#onTrigger$.next();
  }

  @cache()
  get config$(): Observable<Partial<C>> {
    const shadowRoot = this.context.shadowRoot;
    return $.host._.onMutation.getValue(this.context).pipe(
        startWith({}),
        map(() => {
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
  get objectId$(): Observable<string> {
    return $.host._.objectId.getValue(this.context).pipe(
        switchMap(objectId => {
          if (!objectId) {
            return throwError('No object-id found');
          }

          return observableOf(objectId);
        }),
    );
  }

  get onTrigger$(): Observable<unknown> {
    return this.#onTrigger$;
  }
}

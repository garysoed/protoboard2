import { cache } from 'gs-tools/export/data';
import { mapNonNull, Runnable, switchMapNonNull } from 'gs-tools/export/rxjs';
import { Converter } from 'nabu';
import { attributeIn, host, mutationObservable, onMutation, PersonaContext, stringParser } from 'persona';
import { EMPTY, Observable, of as observableOf, Subject } from 'rxjs';
import { map, mapTo, startWith, switchMap } from 'rxjs/operators';
import { Logger } from 'santa';

const LOG = new Logger('protoboard.core.BaseAction');

/**
 * Converters of the action's configuration object.
 *
 * @thHidden
 */
export type ConverterOf<O> = {
  readonly [K in keyof O]: Converter<O[K], string>;
};

/**
 * API of the BaseAction.
 *
 * @thModule action
 */
export const $baseActionApi = {
  objectId: attributeIn('object-id', stringParser()),
};

const $ = {
  host: host({
    ...$baseActionApi,
    onMutation: onMutation({childList: true, subtree: true}),
  }),
};

/**
 * Base class of all actions.
 *
 * @typeParam C - The configuration object.
 * @thModule action
 */
export abstract class BaseAction<C = {}> extends Runnable {
  readonly #onTrigger$ = new Subject<void>();

  /**
   * Instantiates a new BaseAction.
   *
   * @param key - Key to identtify the action. This has to be globally unique.
   * @param actionName - Name of the action. This is used in the help dialog.
   * @param actionConfigConverters - Converters for the configuration object. Every field in the
   *     configuration object must have a converter to string.
   * @param context - The Persona context.
   */
  constructor(
      readonly key: string,
      readonly actionName: string,
      private readonly actionConfigConverters: ConverterOf<C>,
      protected readonly context: PersonaContext,
  ) {
    super();
  }

  /**
   * Triggers the action.
   */
  trigger(): void {
    this.#onTrigger$.next();
  }

  /**
   * Emits the current configuration state for the action.
   */
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

  /**
   * Emits the current object ID of the host element, if any. If not, this doesn't emit any.
   */
  @cache()
  get objectId$(): Observable<string> {
    return $.host._.objectId.getValue(this.context).pipe(
        switchMap(objectId => {
          if (!objectId) {
            LOG.warning('No object-id found');
            return EMPTY;
          }

          return observableOf(objectId);
        }),
    );
  }

  /**
   * Emits whenever the action is triggered.
   */
  get onTrigger$(): Observable<unknown> {
    return this.#onTrigger$;
  }
}

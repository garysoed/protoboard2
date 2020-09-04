import { cache } from 'gs-tools/export/data';
import { mapNonNull, Runnable, switchMapNonNull } from 'gs-tools/export/rxjs';
import { Converter } from 'nabu';
import { host, mutationObservable, onMutation, PersonaContext } from 'persona';
import { Observable, Subject } from 'rxjs';
import { map, mapTo, startWith } from 'rxjs/operators';

import { State } from '../state/state';


export interface ActionContext<P extends object> {
  readonly host$: Observable<Element>;
  readonly personaContext: PersonaContext;
  readonly state$: Observable<State<P>>;
}

/**
 * Converters of the action's configuration object.
 *
 * @thHidden
 */
export type ConverterOf<O> = {
  readonly [K in keyof O]: Converter<O[K], string>;
};

const $ = {
  host: host({
    onMutation: onMutation({childList: true, subtree: true}),
  }),
};

/**
 * Base class of all actions.
 *
 * @typeParam C - The configuration object.
 * @thModule action
 */
export abstract class BaseAction<P extends object, C = {}> extends Runnable {
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
      protected readonly context: ActionContext<P>,
      private readonly defaultConfig: C,
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
  get config$(): Observable<C> {
    const shadowRoot = this.context.personaContext.shadowRoot;
    return $.host._.onMutation.getValue(this.context.personaContext).pipe(
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
        map(config => {
          return {
            ...this.defaultConfig,
            ...(config || {}),
          };
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

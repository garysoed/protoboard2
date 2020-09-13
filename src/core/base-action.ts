import { $asSet, $filterNonNull, $map, $pipe } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
import { Runnable } from 'gs-tools/export/rxjs';
import { Converter } from 'nabu';
import { host, onMutation, PersonaContext } from 'persona';
import { Observable, Subject } from 'rxjs';
import { map, scan, startWith, withLatestFrom } from 'rxjs/operators';

import { ObjectSpec } from '../state-old/object-spec';


export interface ActionContext<P extends object> {
  readonly host$: Observable<Element>;
  readonly personaContext: PersonaContext;
  readonly state$: Observable<ObjectSpec<P>>;
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
    onMutation: onMutation({attributes: true}),
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
    const attributePrefix = `pb-${this.key}-`;
    const attributeFilter = Object.keys(this.actionConfigConverters)
        .map(configKey => `${attributePrefix}${configKey}`);
    const $host = host({
      onMutation: onMutation({attributes: true, attributeFilter}),
    });
    return $host._.onMutation.getValue(this.context.personaContext).pipe(
        startWith(null),
        map(records => {
          if (!records) {
            return new Set(attributeFilter);
          }

          return $pipe(
              records,
              $map(record => record.attributeName),
              $filterNonNull(),
              $asSet(),
          );
        }),
        withLatestFrom($host.getValue(this.context.personaContext)),
        map(([changedAttributes, hostEl]) => {
          const changedConfig: Partial<C> = {};
          for (const attribute of changedAttributes) {
            const rawValue = hostEl.getAttribute(attribute);
            const configKey = attribute.substr(attributePrefix.length) as keyof C;

            const parseResult = this.actionConfigConverters[configKey]
                .convertBackward(rawValue || '');
            if (parseResult.success) {
              changedConfig[configKey] = parseResult.result;
            }
          }

          return changedConfig;
        }),
        scan((config, newConfig) => ({...config, ...newConfig}), {}),
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

import {$stateService, Vine} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {Runnable} from 'gs-tools/export/rxjs';
import {StateId} from 'gs-tools/export/state';
import {Converter} from 'nabu';
import {PersonaContext} from 'persona';
import {Observable, of as observableOf, Subject} from 'rxjs';
import {switchMap, map} from 'rxjs/operators';

import {ObjectSpec} from '../types/object-spec';


export interface ActionContext<O extends ObjectSpec<any>, C> {
  readonly host: Element;
  readonly personaContext: PersonaContext;
  readonly objectId$: Observable<StateId<O>|null>;
  getConfig$(key: string, converters: ConverterOf<C>): Observable<Partial<C>>;
}

export interface TriggerEvent {
  readonly mouseX: number;
  readonly mouseY: number;
}

/**
 * Converters of the action's configuration object.
 *
 * @thHidden
 */
export type ConverterOf<O> = {
  readonly [K in keyof O]: Converter<O[K], string>;
};


/**
 * Base class of all actions.
 *
 * @typeParam C - The configuration object.
 * @thModule action
 */
export abstract class BaseAction<P extends ObjectSpec<any>, C = {}> extends Runnable {
  readonly #onTrigger$ = new Subject<TriggerEvent>();

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
      protected readonly context: ActionContext<P, C>,
      private readonly defaultConfig: C,
  ) {
    super();
  }

  /**
   * Emits the current configuration state for the action.
   */
  @cache()
  get config$(): Observable<C> {
    return this.context.getConfig$(this.key, this.actionConfigConverters).pipe(
        map(config => ({...this.defaultConfig, ...config})),
    );
  }

  @cache()
  get objectSpec$(): Observable<P|undefined> {
    return this.context.objectId$.pipe(
        switchMap(objectId => {
          if (!objectId) {
            return observableOf(undefined);
          }

          return $stateService.get(this.vine).resolve(objectId);
        }),
    );
  }

  @cache()
  get vine(): Vine {
    return this.context.personaContext.vine;
  }

  /**
   * Emits whenever the action is triggered.
   */
  @cache()
  get onTrigger$(): Observable<TriggerEvent> {
    return this.#onTrigger$;
  }

  /**
   * Triggers the action.
   */
  trigger(event: TriggerEvent): void {
    this.#onTrigger$.next(event);
  }
}

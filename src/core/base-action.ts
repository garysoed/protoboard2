import {$resolveState, Vine} from 'grapevine';
import {StateId} from 'gs-tools/export/state';
import {Converter} from 'nabu';
import {Observable, OperatorFunction} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {ObjectSpec} from '../types/object-spec';


export interface ActionContext<O extends ObjectSpec<any>, C> {
  readonly config$: Observable<C>
  readonly objectId$: Observable<StateId<O>|null>;
  readonly vine: Vine;
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
export abstract class BaseAction<P extends ObjectSpec<any>, C> {
  protected getObject$(context: ActionContext<P, C>): Observable<P|undefined> {
    return context.objectId$.pipe(
        switchMap(objectId => $resolveState.get(context.vine)(objectId)),
    );
  }

  abstract getOperator(context: ActionContext<P, C>): OperatorFunction<TriggerEvent, unknown>;
}

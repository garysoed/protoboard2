import {Converter} from 'nabu';
import {OperatorFunction} from 'rxjs';

import {ActionContext} from '../action/action-context';
import {ObjectSpec} from '../types/object-spec';


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
  abstract getOperator(context: ActionContext<P, C>): OperatorFunction<TriggerEvent, unknown>;
}

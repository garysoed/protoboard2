import {OperatorFunction} from 'rxjs';

import {ActionContext} from '../action/action-context';
import {ObjectSpec} from '../types/object-spec';

import {TriggerEvent} from './trigger-event';


/**
 * Base class of all actions.
 *
 * @typeParam C - The configuration object.
 * @thModule action
 */
export abstract class BaseAction<P extends ObjectSpec<any>, C> {
  abstract getOperator(context: ActionContext<P, C>): OperatorFunction<TriggerEvent, unknown>;
}

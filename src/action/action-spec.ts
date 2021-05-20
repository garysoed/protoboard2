import {Input, UnresolvedElementProperty} from 'persona/export/internal';
import {OperatorFunction} from 'rxjs';

import {TriggerEvent} from '../core/trigger-event';
import {UnreservedTriggerSpec} from '../core/trigger-spec';
import {ObjectSpec} from '../types/object-spec';

import {ActionContext} from './action-context';


export type ConfigSpecs<C> = {
  readonly [K in keyof C]: UnresolvedElementProperty<Element, Input<C[K]>>;
}

export type Action<O extends ObjectSpec<any>, C> = (context: ActionContext<O, C>) => OperatorFunction<TriggerEvent, unknown>;

export interface ActionSpec<C> {
  readonly action: Action<any, C>;
  readonly actionName: string;
  readonly configSpecs: ConfigSpecs<C>;
  readonly defaultConfig: C;
  readonly trigger: UnreservedTriggerSpec;
}
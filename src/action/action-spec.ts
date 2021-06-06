import {Input, Resolved, UnresolvedAttributeInput, UnresolvedElementProperty} from 'persona/export/internal';
import {Observable} from 'rxjs';

import {DetailedTriggerSpec} from '../core/trigger-spec';

import {ActionContext} from './action-context';


export type UnresolvedConfigSpecs<C> = {
  readonly [K in keyof C]: UnresolvedAttributeInput<C[K]>;
};

export type ConfigSpecs<C> = Resolved<
  Element,
  {readonly [K in keyof C]: UnresolvedElementProperty<Element, Input<C[K]>>}
>;

export interface TriggerConfig {
  readonly trigger: DetailedTriggerSpec;
}

export type Action<O> = (context: ActionContext<O>) => Observable<unknown>;

export type NormalizedTriggerConfig<C extends TriggerConfig> = C & {
  readonly trigger: DetailedTriggerSpec;
}

export interface ActionSpec<C extends TriggerConfig> {
  readonly action: Action<any>;
  readonly actionName: string;
  readonly configSpecs: ConfigSpecs<C>;
}
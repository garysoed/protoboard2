import {UnresolvedAttributeInput} from 'persona/export/internal';
import {Observable} from 'rxjs';

import {TriggerSpec} from '../core/trigger-spec';

import {ActionContext} from './action-context';


export type UnresolvedConfigSpecs<C> = {
  readonly [K in keyof C]: UnresolvedAttributeInput<C[K]>;
};

export interface TriggerConfig {
  readonly trigger: TriggerSpec|null;
}

export type Action<O> = (context: ActionContext<O>) => Observable<unknown>;

export interface ActionSpec<O, C extends TriggerConfig> {
  readonly action: Action<O>;
  readonly actionName: string;
  readonly config$: Observable<C>;
}
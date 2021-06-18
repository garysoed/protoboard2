import {UnresolvedAttributeInput} from 'persona/export/internal';
import {Observable} from 'rxjs';

import {TriggerEvent} from '../core/trigger-event';
import {TriggerSpec} from '../core/trigger-spec';


export type UnresolvedConfigSpecs<C> = {
  readonly [K in keyof C]: UnresolvedAttributeInput<C[K]>;
};

export interface TriggerConfig {
  readonly trigger: TriggerSpec|null;
}

export type Action = () => Observable<unknown>;

export interface ActionSpec<C extends TriggerConfig> {
  readonly action: Action;
  readonly actionName: string;
  readonly config$: Observable<C>;
  readonly trigger$: Observable<TriggerEvent>;
}
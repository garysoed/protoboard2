import {Vine} from 'grapevine';
import {StateId} from 'gs-tools/export/state';
import {UnresolvedAttributeInput} from 'persona/export/internal';
import {Observable, OperatorFunction} from 'rxjs';

import {TriggerEvent} from '../core/trigger-event';
import {TriggerSpec} from '../core/trigger-spec';


export type UnresolvedConfigSpecs<C> = {
  readonly [K in keyof C]: UnresolvedAttributeInput<C[K]>;
};

export interface TriggerConfig {
  readonly trigger: TriggerSpec|null;
}

export type Action = OperatorFunction<TriggerEvent, unknown>;

export interface ActionParams<C, O> {
  readonly config$: Observable<C>;
  readonly objectId$: Observable<StateId<O>|undefined>;
  readonly vine: Vine;
}

export interface ActionSpec {
  readonly action: Action;
  readonly actionName: string;
  readonly triggerSpec$: Observable<TriggerSpec|null>;
  readonly trigger$: Observable<TriggerEvent>;
}
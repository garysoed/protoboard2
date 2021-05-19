import {Input, UnresolvedElementProperty} from 'persona/export/internal';

import {BaseAction} from '../core/base-action';
import {UnreservedTriggerSpec} from '../core/trigger-spec';


export type ConfigSpecs<C> = {
  readonly [K in keyof C]: UnresolvedElementProperty<Element, Input<C[K]>>;
}

export interface ActionSpec<C> {
  readonly action: BaseAction<any, C>;
  readonly actionName: string;
  readonly configSpecs: ConfigSpecs<C>;
  readonly defaultConfig: C;
  readonly trigger: UnreservedTriggerSpec;
}
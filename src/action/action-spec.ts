import {BaseAction} from '../core/base-action';
import {UnreservedTriggerSpec} from '../core/trigger-spec';


export interface ActionSpec<C> {
  readonly defaultConfig: C;
  readonly trigger: UnreservedTriggerSpec;
  readonly action: BaseAction<any, C>;
}
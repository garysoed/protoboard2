import {Vine} from 'grapevine';
import {EMPTY} from 'rxjs';

import {ObjectSpec} from '../../types/object-spec';
import {ActionContext} from '../action-context';
import {NormalizedTriggerConfig, TriggerConfig} from '../action-spec';


export function createFakeActionContext<O extends ObjectSpec<any>, C extends TriggerConfig>(
    context: Partial<ActionContext<O, NormalizedTriggerConfig<C>>> & {readonly vine: Vine},
): ActionContext<O, NormalizedTriggerConfig<C>> {
  return {
    config$: EMPTY,
    objectId$: EMPTY,
    ...context,
  };
}

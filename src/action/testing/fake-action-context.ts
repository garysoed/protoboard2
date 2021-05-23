import {Vine} from 'grapevine';
import {EMPTY} from 'rxjs';

import {ActionContext} from '../action-context';
import {NormalizedTriggerConfig, TriggerConfig} from '../action-spec';


export function createFakeActionContext<O, C extends TriggerConfig>(
    context: Partial<ActionContext<O, NormalizedTriggerConfig<C>>> & {readonly vine: Vine},
): ActionContext<O, NormalizedTriggerConfig<C>> {
  return {
    config$: EMPTY,
    objectId$: EMPTY,
    ...context,
  };
}

import {NEVER, OperatorFunction} from 'rxjs';
import {switchMapTo} from 'rxjs/operators';

import {TriggerEvent} from '../core/trigger-event';
import {UnreservedTriggerSpec} from '../core/trigger-spec';

import {ActionSpec} from './action-spec';


function action(): OperatorFunction<TriggerEvent, unknown> {
  return switchMapTo(NEVER);
}


export function shuffleAction(
    trigger: UnreservedTriggerSpec,
): ActionSpec<{}> {
  return {
    action,
    actionName: 'Shuffle',
    configSpecs: {},
    trigger,
  };
}
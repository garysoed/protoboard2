import {cache} from 'gs-tools/export/data';
import {NEVER, OperatorFunction} from 'rxjs';
import {switchMapTo} from 'rxjs/operators';

import {BaseAction} from '../core/base-action';
import {TriggerEvent} from '../core/trigger-event';
import {UnreservedTriggerSpec} from '../core/trigger-spec';
import {ContainerSpec} from '../types/container-spec';

import {ActionSpec} from './action-spec';


class ShuffleAction extends BaseAction<ContainerSpec<unknown, 'indexed'>, {}> {
  @cache()
  getOperator(): OperatorFunction<TriggerEvent, unknown> {
    return switchMapTo(NEVER);
  }
}


export function shuffleAction(
    trigger: UnreservedTriggerSpec,
): ActionSpec<{}> {
  return {
    action: new ShuffleAction(),
    actionName: 'Shuffle',
    configSpecs: {},
    defaultConfig: {},
    trigger,
  };
}
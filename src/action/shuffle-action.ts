import {cache} from 'gs-tools/export/data';
import {NEVER, OperatorFunction} from 'rxjs';
import {switchMapTo} from 'rxjs/operators';

import {BaseAction, TriggerEvent} from '../core/base-action';
import {UnreservedTriggerSpec} from '../core/trigger-spec';
import {ContainerSpec} from '../types/container-spec';

import {ActionSpec} from './action-spec';


class ShuffleAction extends BaseAction<ContainerSpec<unknown, 'indexed'>, {}> {
  constructor() {
    super('Shuffle');
  }

  @cache()
  getOperator(): OperatorFunction<TriggerEvent, unknown> {
    return switchMapTo(NEVER);
  }
}


export function shuffleAction(
    trigger: UnreservedTriggerSpec,
): ActionSpec<{}> {
  return {
    defaultConfig: {},
    trigger,
    action: new ShuffleAction(),
    configSpecs: {},
  };
}
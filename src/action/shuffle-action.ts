import {attributeIn} from 'persona';
import {NEVER, OperatorFunction} from 'rxjs';
import {switchMapTo} from 'rxjs/operators';

import {TriggerEvent} from '../core/trigger-event';
import {triggerSpecParser, TriggerType} from '../core/trigger-spec';

import {ActionSpec, TriggerConfig} from './action-spec';

type Config = TriggerConfig;


function action(): OperatorFunction<TriggerEvent, unknown> {
  return switchMapTo(NEVER);
}

const DEFAULT_CONFIG: Config = {
  trigger: TriggerType.S,
};

export function shuffleAction(
    defaultOverride: Partial<Config> = {},
): ActionSpec<Config> {
  const defaultConfig = {...DEFAULT_CONFIG, ...defaultOverride};
  return {
    action,
    actionName: 'Shuffle',
    configSpecs: {
      trigger: attributeIn('pb-shuffle', triggerSpecParser(), defaultConfig.trigger),
    },
  };
}
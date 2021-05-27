import {attributeIn} from 'persona';
import {NEVER, OperatorFunction} from 'rxjs';
import {switchMapTo} from 'rxjs/operators';

import {TriggerEvent} from '../core/trigger-event';
import {triggerSpecParser, TriggerType} from '../core/trigger-spec';

import {ActionSpec, ConfigSpecs, TriggerConfig, UnresolvedConfigSpecs} from './action-spec';

type Config = TriggerConfig;


function action(): OperatorFunction<TriggerEvent, unknown> {
  return switchMapTo(NEVER);
}

const DEFAULT_CONFIG: Config = {
  trigger: TriggerType.S,
};

export function shuffleActionConfigSpecs(defaultOverride: Partial<Config>): UnresolvedConfigSpecs<Config> {
  const defaultConfig = {...DEFAULT_CONFIG, ...defaultOverride};
  return {
    trigger: attributeIn('pb-shuffle', triggerSpecParser(), defaultConfig.trigger),
  };
}


export function shuffleAction(configSpecs: ConfigSpecs<Config>): ActionSpec<Config> {
  return {
    action,
    actionName: 'Shuffle',
    configSpecs,
  };
}

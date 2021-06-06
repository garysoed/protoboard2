import {attributeIn} from 'persona';
import {NEVER} from 'rxjs';

import {triggerSpecParser, TriggerType} from '../core/trigger-spec';

import {Action, ActionSpec, ConfigSpecs, TriggerConfig, UnresolvedConfigSpecs} from './action-spec';


type Config = TriggerConfig;


function actionFactory(): Action<unknown> {
  return () => NEVER;
}

const DEFAULT_CONFIG: Config = {
  trigger: {type: TriggerType.S},
};

export function shuffleActionConfigSpecs(defaultOverride: Partial<Config>): UnresolvedConfigSpecs<Config> {
  const defaultConfig = {...DEFAULT_CONFIG, ...defaultOverride};
  return {
    trigger: attributeIn('pb-shuffle', triggerSpecParser(), defaultConfig.trigger),
  };
}


export function shuffleAction(configSpecs: ConfigSpecs<Config>): ActionSpec<Config> {
  return {
    action: actionFactory(),
    actionName: 'Shuffle',
    configSpecs,
  };
}

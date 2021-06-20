import {attributeIn} from 'persona';
import {NEVER} from 'rxjs';

import {triggerSpecParser, TriggerType} from '../core/trigger-spec';

import {Action, TriggerConfig, UnresolvedConfigSpecs} from './action-spec';


type Config = TriggerConfig;


export function shuffleAction(): Action {
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


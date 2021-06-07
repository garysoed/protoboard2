import {attributeIn} from 'persona';
import {NEVER, Observable} from 'rxjs';

import {triggerSpecParser, TriggerType} from '../core/trigger-spec';

import {Action, ActionSpec, TriggerConfig, UnresolvedConfigSpecs} from './action-spec';


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


export function shuffleAction(config$: Observable<Config>): ActionSpec<unknown, Config> {
  return {
    action: actionFactory(),
    actionName: 'Shuffle',
    config$,
  };
}

import {attributeIn, PersonaContext} from 'persona';
import {NEVER, Observable} from 'rxjs';

import {triggerSpecParser, TriggerType} from '../core/trigger-spec';

import {Action, ActionSpec, TriggerConfig, UnresolvedConfigSpecs} from './action-spec';
import {createTrigger} from './util/setup-trigger';


type Config = TriggerConfig;


function actionFactory(): Action {
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


export function shuffleAction(
    config$: Observable<Config>,
    context: PersonaContext,
): ActionSpec<Config> {
  return {
    action: actionFactory(),
    actionName: 'Shuffle',
    config$,
    trigger$: config$.pipe(createTrigger(context)),
  };
}

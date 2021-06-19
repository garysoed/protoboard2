import {attributeIn, PersonaContext} from 'persona';
import {NEVER, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

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
): ActionSpec {
  return {
    action: actionFactory(),
    actionName: 'Shuffle',
    triggerSpec$: config$.pipe(map(({trigger}) => trigger)),
    trigger$: config$.pipe(createTrigger(context)),
  };
}

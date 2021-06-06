import {$stateService} from 'grapevine';
import {attributeIn, integerParser} from 'persona';
import {tap, withLatestFrom} from 'rxjs/operators';

import {triggerSpecParser, TriggerType} from '../core/trigger-spec';
import {IsMultifaced} from '../payload/is-multifaced';

import {getObject$} from './action-context';
import {Action, ActionSpec, ConfigSpecs, TriggerConfig, UnresolvedConfigSpecs} from './action-spec';
import {$random} from './util/random';
import {createTrigger} from './util/setup-trigger';


export interface Config extends TriggerConfig {
  readonly count: number;
}

function actionFactory(configSpecs: ConfigSpecs<Config>): Action<IsMultifaced> {
  return context => {
    const vine = context.personaContext.vine;
    return createTrigger(configSpecs, context.personaContext).pipe(
        withLatestFrom(getObject$(context)),
        tap(([{config}, obj]) => {
          if (!obj) {
            return;
          }

          const randomValue = $random.get(vine).next();
          if (randomValue === null) {
            throw new Error('Random produced no values');
          }
          const nextIndex = Math.floor(randomValue * config.count);
          $stateService.get(vine).modify(x => x.set(obj.$currentFaceIndex, nextIndex));
        }),
    );
  };
}

const DEFAULT_CONFIG: Config = {
  count: 1,
  trigger: {type: TriggerType.L},
};

export function rollActionConfigSpecs(defaultOverride: Partial<Config>): UnresolvedConfigSpecs<Config> {
  const defaultConfig = {...DEFAULT_CONFIG, ...defaultOverride};
  return {
    count: attributeIn('pb-roll-count', integerParser(), defaultConfig.count),
    trigger: attributeIn('pb-roll-trigger', triggerSpecParser(), defaultConfig.trigger),
  };
}


export function rollAction(configSpecs: ConfigSpecs<Config>): ActionSpec<Config> {
  return {
    action: actionFactory(configSpecs),
    actionName: 'Roll',
    configSpecs,
  };
}
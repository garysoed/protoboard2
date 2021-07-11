import {$stateService} from 'grapevine';
import {attributeIn, integerParser} from 'persona';
import {pipe} from 'rxjs';
import {map, withLatestFrom} from 'rxjs/operators';

import {triggerSpecParser, TriggerType} from '../core/trigger-spec';
import {IsMultifaced} from '../payload/is-multifaced';

import {Action, ActionParams, TriggerConfig, UnresolvedConfigSpecs} from './action-spec';
import {$random} from './util/random';


export interface Config extends TriggerConfig {
  readonly count: number;
}

export function rollAction({config$, objectPath$, vine}: ActionParams<Config, IsMultifaced>): Action {
  return pipe(
      withLatestFrom(config$),
      map(([, config]) => {
        const randomValue = $random.get(vine).next();
        if (randomValue === null) {
          throw new Error('Random produced no values');
        }
        return Math.floor(randomValue * config.count);
      }),
      $stateService.get(vine)._(objectPath$).$('currentFaceIndex').set(),
  );
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

import {$stateService} from 'grapevine';
import {attributeIn, integerParser} from 'persona';
import {pipe} from 'rxjs';
import {map, withLatestFrom} from 'rxjs/operators';

import {triggerSpecParser, TriggerType} from '../core/trigger-spec';
import {IsMultifaced} from '../payload/is-multifaced';

import {Action, ActionParams, TriggerConfig, UnresolvedConfigSpecs} from './action-spec';


export interface Config extends TriggerConfig {
  readonly count: number;
}

export const KEY = 'turn';

export function turnAction({config$, objectPath$, vine}: ActionParams<Config, IsMultifaced>): Action {
  const currentFaceIndex = $stateService.get(vine)._(objectPath$).$('currentFaceIndex');
  return pipe(
      withLatestFrom(config$, currentFaceIndex),
      map(([, config, faceIndex]) => {
        const faceCount = config.count;
        return ((faceIndex ?? 0) + 1) % faceCount;
      }),
      currentFaceIndex.set(),
  );
}

const DEFAULT_CONFIG: Config = {
  count: 1,
  trigger: {type: TriggerType.T},
};


export function turnActionConfigSpecs(defaultOverride: Partial<Config>): UnresolvedConfigSpecs<Config> {
  const defaultConfig = {...DEFAULT_CONFIG, ...defaultOverride};
  return {
    count: attributeIn('pb-turn-count', integerParser(), defaultConfig.count),
    trigger: attributeIn('pb-turn-trigger', triggerSpecParser(), defaultConfig.trigger),
  };
}

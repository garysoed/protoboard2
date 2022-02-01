import {$stateService} from 'grapevine';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {attributeIn, integerParser} from 'persona';
import {pipe} from 'rxjs';
import {map, withLatestFrom} from 'rxjs/operators';

import {IsMultifaced} from '../../src-next/types/is-multifaced';
import {triggerSpecParser, TriggerType} from '../core/trigger-spec';

import {Action, ActionParams, TriggerConfig, UnresolvedConfigSpecs} from './action-spec';


export interface Config extends TriggerConfig {
  readonly count: number;
}

export const KEY = 'flip';

export function flipAction({config$, objectPath$, vine}: ActionParams<Config, IsMultifaced>): Action {
  const faceIndex = $stateService.get(vine)._(objectPath$).$('currentFaceIndex');
  return pipe(
      withLatestFrom(config$, faceIndex),
      map(([, config, faceIndex]) => {
        if (faceIndex === undefined) {
          return;
        }

        const faceCount = config.count;
        return ((faceIndex ?? 0) + Math.floor(faceCount / 2)) % faceCount;
      }),
      filterNonNullable(),
      faceIndex.set(),
  );
}

const DEFAULT_CONFIG: Config = {
  count: 1,
  trigger: {type: TriggerType.F},
};

export function flipActionConfigSpecs(defaultOverride: Partial<Config>): UnresolvedConfigSpecs<Config> {
  const defaultConfig = {...DEFAULT_CONFIG, ...defaultOverride};
  return {
    count: attributeIn('pb-flip-count', integerParser(), defaultConfig.count),
    trigger: attributeIn('pb-flip-trigger', triggerSpecParser(), defaultConfig.trigger),
  };
}

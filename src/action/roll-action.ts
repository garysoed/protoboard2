import {$resolveStateOp, $stateService} from 'grapevine';
import {attributeIn, integerParser} from 'persona';
import {pipe} from 'rxjs';
import {tap, withLatestFrom} from 'rxjs/operators';

import {triggerSpecParser, TriggerType} from '../core/trigger-spec';
import {IsMultifaced} from '../payload/is-multifaced';

import {Action, ActionParams, TriggerConfig, UnresolvedConfigSpecs} from './action-spec';
import {$random} from './util/random';


export interface Config extends TriggerConfig {
  readonly count: number;
}

export function rollAction({config$, objectId$, vine}: ActionParams<Config, IsMultifaced>): Action {
  return pipe(
      withLatestFrom(config$, objectId$.pipe($resolveStateOp.get(vine)())),
      tap(([, config, obj]) => {
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

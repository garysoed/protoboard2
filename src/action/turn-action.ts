import {$resolveStateOp, $stateService} from 'grapevine';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {attributeIn, integerParser} from 'persona';
import {of, pipe} from 'rxjs';
import {switchMap, take, withLatestFrom} from 'rxjs/operators';

import {triggerSpecParser, TriggerType} from '../core/trigger-spec';
import {IsMultifaced} from '../payload/is-multifaced';

import {Action, ActionParams, TriggerConfig, UnresolvedConfigSpecs} from './action-spec';


export interface Config extends TriggerConfig {
  readonly count: number;
}

export const KEY = 'turn';

export function turnAction({config$, objectId$, vine}: ActionParams<Config, IsMultifaced>): Action {
  const stateService = $stateService.get(vine);
  return pipe(
      withLatestFrom(config$, objectId$.pipe($resolveStateOp.get(vine)())),
      switchMap(([, config, obj]) => {
        if (!obj) {
          return of(null);
        }

        const faceCount = config.count;
        const $faceIndex = obj.$currentFaceIndex;
        return stateService.resolve($faceIndex).pipe(
            take(1),
            filterNonNullable(),
            stateService.modifyOperator((x, faceIndex) => {
              x.set($faceIndex, ((faceIndex ?? 0) + 1) % faceCount);
            }),
        );
      }),
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

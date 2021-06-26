import {$resolveStateOp, $stateService} from 'grapevine';
import {attributeIn, integerParser} from 'persona';
import {pipe} from 'rxjs';
import {map, switchMap, tap, withLatestFrom} from 'rxjs/operators';

import {triggerSpecParser, TriggerType} from '../core/trigger-spec';
import {IsMultifaced} from '../payload/is-multifaced';

import {Action, ActionParams, TriggerConfig, UnresolvedConfigSpecs} from './action-spec';


export interface Config extends TriggerConfig {
  readonly count: number;
}

export const KEY = 'flip';

export function flipAction({config$, objectId$, vine}: ActionParams<Config, IsMultifaced>): Action {
  const stateService = $stateService.get(vine);
  const faceIndexId$ = objectId$.pipe($resolveStateOp.get(vine)()).pipe(
      map(obj => {
        return obj?.$currentFaceIndex;
      }),
  );
  const faceIndex$ = faceIndexId$.pipe(
      switchMap(faceIndexId => {
        return stateService.resolve(faceIndexId);
      }),
  );

  return pipe(
      withLatestFrom(config$, faceIndex$, faceIndexId$),
      tap(([, config, faceIndex, faceIndexId]) => {
        if (faceIndex === undefined || faceIndexId === undefined) {
          return;
        }

        const faceCount = config.count;
        stateService.modify(x => x.set(
            faceIndexId,
            ((faceIndex ?? 0) + Math.floor(faceCount / 2)) % faceCount,
        ));
      }),
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

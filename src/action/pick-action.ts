import {$stateService} from 'grapevine';
import {attributeIn} from 'persona';
import {combineLatest, EMPTY, of, pipe} from 'rxjs';
import {map, switchMap, withLatestFrom} from 'rxjs/operators';

import {$activeSpec} from '../core/active-spec';
import {triggerSpecParser, TriggerType} from '../core/trigger-spec';
import {$getParent} from '../objects/content-map';

import {Action, ActionParams, TriggerConfig, UnresolvedConfigSpecs} from './action-spec';
import {moveObject} from './util/move-object';


export type Config = TriggerConfig;

export function pickAction({objectId$, vine}: ActionParams<Config, {}>): Action {
  const stateService = $stateService.get(vine);
  const fromObjectId$ = combineLatest([
    objectId$,
    $getParent.get(vine),
  ])
      .pipe(
          map(([objectId, getParent]) => {
            if (!objectId) {
              return null;
            }
            return getParent(objectId);
          }),
      );

  return pipe(
      withLatestFrom(
          $activeSpec.get(vine).$('$contentSpecs'),
          objectId$,
      ),
      switchMap(([, activeContents, movedObjectId]) => {
        if (!movedObjectId) {
          return EMPTY;
        }

        const toIndex = activeContents?.length ?? 0;
        return of({id: movedObjectId, toIndex}).pipe(
        );
      }),
      moveObject(stateService.resolve(fromObjectId$), $activeSpec.get(vine), vine),
  );
}

const DEFAULT_CONFIG: Config = {
  trigger: {type: TriggerType.CLICK},
};

export function pickActionConfigSpecs(defaultOverride: Partial<Config>): UnresolvedConfigSpecs<Config> {
  const defaultConfig = {...DEFAULT_CONFIG, ...defaultOverride};
  return {
    trigger: attributeIn('pb-pick-trigger', triggerSpecParser(), defaultConfig.trigger),
  };
}

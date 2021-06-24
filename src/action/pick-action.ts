import {$resolveState, $stateService} from 'grapevine';
import {attributeIn} from 'persona';
import {combineLatest, of, pipe} from 'rxjs';
import {map, switchMap, tap, withLatestFrom} from 'rxjs/operators';

import {$activeSpec} from '../core/active-spec';
import {triggerSpecParser, TriggerType} from '../core/trigger-spec';
import {$getParent} from '../objects/content-map';

import {Action, ActionParams, TriggerConfig, UnresolvedConfigSpecs} from './action-spec';
import {moveObject} from './util/move-object';


export type Config = TriggerConfig;

export function pickAction({objectId$, context}: ActionParams<Config, {}>): Action {
  const vine = context.vine;
  const fromObjectSpec$ = combineLatest([
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
          switchMap(fromObjectId => {
            if (!fromObjectId) {
              return of(null);
            }
            return $resolveState.get(vine)(fromObjectId);
          }),
      );
  const activeContents$ = $activeSpec.get(vine).pipe(
      switchMap(activeSpec => {
        if (!activeSpec) {
          return of(undefined);
        }
        return $stateService.get(vine).resolve(activeSpec.$contentSpecs);
      }),
  );

  const moveFn$ = combineLatest([
    fromObjectSpec$,
    $activeSpec.get(vine),
    activeContents$,
    objectId$,
  ])
      .pipe(
          switchMap(([fromObjectSpec, activeState, activeContents, movedObjectId]) => {
            if (!fromObjectSpec || !activeState || !movedObjectId) {
              return of(null);
            }

            return moveObject(
                fromObjectSpec,
                activeState,
                vine,
            )
                .pipe(
                    map(fn => {
                      if (!fn) {
                        return null;
                      }

                      return () => {
                        const destIndex = activeContents?.length ?? 0;
                        fn(movedObjectId, destIndex);
                      };
                    }),
                );
          }),
      );

  return pipe(
      withLatestFrom(moveFn$),
      tap(([, moveFn]) => {
        if (!moveFn) {
          return;
        }

        moveFn();
      }),
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

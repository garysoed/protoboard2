import {$resolveState, $stateService} from 'grapevine';
import {$asArray, $map, $max, $pipe, normal} from 'gs-tools/export/collect';
import {attributeIn, PersonaContext} from 'persona';
import {combineLatest, Observable, of} from 'rxjs';
import {map, switchMap, tap, withLatestFrom} from 'rxjs/operators';

import {$activeSpec} from '../core/active-spec';
import {triggerSpecParser, TriggerType} from '../core/trigger-spec';
import {$getParent} from '../objects/content-map';

import {Action, ActionSpec, TriggerConfig, UnresolvedConfigSpecs} from './action-spec';
import {ObjectIdObs} from './object-id-obs';
import {moveObject} from './util/move-object';
import {createTrigger} from './util/setup-trigger';


export type Config = TriggerConfig;

function actionFactory(
    config$: Observable<Config>,
    objectId$: ObjectIdObs<{}>,
    personaContext: PersonaContext,
): Action {
  return () => {
    const vine = personaContext.vine;
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
                          const destIndex = $pipe(
                              activeContents ?? [],
                              $map(content => content.coordinate.index),
                              $asArray(),
                              $max(normal()),
                          );

                          fn(movedObjectId, {index: (destIndex ?? 0) + 1});
                        };
                      }),
                  );
            }),
        );

    return config$.pipe(
        createTrigger(personaContext),
        withLatestFrom(moveFn$),
        tap(([, moveFn]) => {
          if (!moveFn) {
            return;
          }

          moveFn();
        }),
    );
  };
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

export function pickAction(
    config$: Observable<Config>,
    objectId$: ObjectIdObs<{}>,
    context: PersonaContext,
): ActionSpec<Config> {
  return {
    action: actionFactory(config$, objectId$, context),
    actionName: 'Pick',
    config$,
    trigger$: config$.pipe(createTrigger(context)),
  };
}
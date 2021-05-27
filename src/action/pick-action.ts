import {$resolveState, $stateService} from 'grapevine';
import {$asArray, $map, $max, $pipe, normal} from 'gs-tools/export/collect';
import {attributeIn} from 'persona';
import {combineLatest, of, OperatorFunction, pipe} from 'rxjs';
import {map, switchMap, tap, withLatestFrom} from 'rxjs/operators';

import {$activeSpec} from '../core/active-spec';
import {TriggerEvent} from '../core/trigger-event';
import {triggerSpecParser, TriggerType} from '../core/trigger-spec';
import {$getParent} from '../objects/content-map';

import {ActionContext} from './action-context';
import {ActionSpec, ConfigSpecs, TriggerConfig, UnresolvedConfigSpecs} from './action-spec';
import {moveObject} from './util/move-object';


export type Config = TriggerConfig;

function action(context: ActionContext<{}, Config>): OperatorFunction<TriggerEvent, unknown> {
  const fromObjectSpec$ = combineLatest([
    context.objectId$,
    $getParent.get(context.vine),
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
            return $resolveState.get(context.vine)(fromObjectId);
          }),
      );
  const activeContents$ = $activeSpec.get(context.vine).pipe(
      switchMap(activeSpec => {
        if (!activeSpec) {
          return of(undefined);
        }
        return $stateService.get(context.vine).resolve(activeSpec.$contentSpecs);
      }),
  );

  const moveFn$ = combineLatest([
    fromObjectSpec$,
    $activeSpec.get(context.vine),
    activeContents$,
    context.objectId$,
  ])
      .pipe(
          switchMap(([fromObjectSpec, activeState, activeContents, movedObjectId]) => {
            if (!fromObjectSpec || !activeState || !movedObjectId) {
              return of(null);
            }

            return moveObject(
                fromObjectSpec,
                activeState,
                context.vine,
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
  trigger: TriggerType.P,
};

export function pickActionConfigSpecs(defaultOverride: Partial<Config>): UnresolvedConfigSpecs<Config> {
  const defaultConfig = {...DEFAULT_CONFIG, ...defaultOverride};
  return {
    trigger: attributeIn('pb-pick-trigger', triggerSpecParser(), defaultConfig.trigger),
  };
}

export function pickAction(configSpecs: ConfigSpecs<Config>): ActionSpec<Config> {
  return {
    action,
    actionName: 'Pick',
    configSpecs,
  };
}
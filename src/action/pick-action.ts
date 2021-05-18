import {$resolveState, $stateService} from 'grapevine';
import {$asArray, $map, $max, $pipe, normal} from 'gs-tools/export/collect';
import {combineLatest, of, OperatorFunction, pipe} from 'rxjs';
import {map, switchMap, tap, withLatestFrom} from 'rxjs/operators';

import {ActionContext, BaseAction, TriggerEvent} from '../core/base-action';
import {UnreservedTriggerSpec} from '../core/trigger-spec';
import {$activeSpec} from '../objects/active-spec';
import {$getParent} from '../objects/content-map';
import {PieceSpec} from '../types/piece-spec';

import {ActionSpec} from './action-spec';
import {moveObject} from './util/move-object';


// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Config { }

/**
 * Lets the user pick up the object.
 *
 * @thModule action
 */
class PickAction extends BaseAction<PieceSpec<any>, Config> {
  /**
   * @internal
   */
  constructor() {
    super('pick', 'Pick', {});
  }

  getOperator(context: ActionContext<PieceSpec<any>, Config>): OperatorFunction<TriggerEvent, unknown> {
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
          return $stateService.get(context.vine).resolve(activeSpec.payload.$contentSpecs);
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
                  fromObjectSpec.payload,
                  activeState.payload,
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
}

export function pickAction(
    trigger: UnreservedTriggerSpec,
): ActionSpec<Config> {
  return {
    defaultConfig: {},
    trigger,
    action: new PickAction(),
    configSpecs: {},
  };
}
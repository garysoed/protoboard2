import {$stateService} from 'grapevine';
import {attributeIn, enumParser} from 'persona';
import {combineLatest, of, OperatorFunction, pipe} from 'rxjs';
import {map, switchMap, tap, withLatestFrom} from 'rxjs/operators';

import {BaseAction, ActionContext, TriggerEvent} from '../core/base-action';
import {UnreservedTriggerSpec} from '../core/trigger-spec';
import {$activeSpec} from '../objects/active-spec';
import {ContainerSpec} from '../types/container-spec';

import {ActionSpec, ConfigSpecs} from './action-spec';
import {moveObject} from './util/move-object';

export enum PositioningType {
  DEFAULT = 'default',
}


export interface Config {
  readonly positioning: PositioningType;
}


/**
 * Lets the user drop an object onto this object.
 *
 * @thModule action
 */
class DropAction extends BaseAction<ContainerSpec<unknown, 'indexed'>, Config> {
  constructor() {
    super('Drop', 'drop', {positioning: enumParser<PositioningType>(PositioningType)});
  }

  getOperator(context: ActionContext<ContainerSpec<unknown, 'indexed'>, Config>): OperatorFunction<TriggerEvent, unknown> {
    const moveObjectFn$ = combineLatest([
      this.getObject$(context),
      $activeSpec.get(context.vine),
      context.config$,
    ])
        .pipe(
            switchMap(([toState, activeState, config]) => {
              if (!toState || !activeState) {
                return of(null);
              }

              return $stateService.get(context.vine).resolve(activeState.payload.$contentSpecs).pipe(
                  switchMap(activeContents => {
                    const normalizedActiveContents = activeContents ?? [];
                    const movedObjectSpec = normalizedActiveContents[normalizedActiveContents.length - 1];
                    if (!movedObjectSpec) {
                      return of(null);
                    }

                    return moveObject(
                        activeState.payload,
                        toState.payload,
                        context.vine,
                    )
                        .pipe(
                            map(fn => {
                              if (!fn) {
                                return null;
                              }

                              return () => {
                                fn(movedObjectSpec.objectId, {index: this.locate(config.positioning)});
                              };
                            }),
                        );
                  }),
              );
            }),
        );
    return pipe(
        withLatestFrom(moveObjectFn$),
        tap(([, moveObjectFn]) => {
          if (!moveObjectFn) {
            return;
          }

          moveObjectFn();
        }),
    );
  }

  private locate(positioning: PositioningType): number {
    switch (positioning) {
      case PositioningType.DEFAULT:
        return 0;
    }
  }
}

export function dropAction(
    defaultConfig: Config,
    trigger: UnreservedTriggerSpec,
    configSpecsOverride: Partial<ConfigSpecs<Config>> = {},
): ActionSpec<Config> {
  return {
    defaultConfig,
    trigger,
    action: new DropAction(),
    configSpecs: {
      positioning: attributeIn(
          'pb-drop-positioning',
          enumParser<PositioningType>(PositioningType),
          defaultConfig.positioning,
      ),
      ...configSpecsOverride,
    },
  };
}
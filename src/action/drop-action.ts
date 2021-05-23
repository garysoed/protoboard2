import {$stateService} from 'grapevine';
import {attributeIn, enumParser} from 'persona';
import {combineLatest, of, OperatorFunction, pipe} from 'rxjs';
import {map, switchMap, tap, withLatestFrom} from 'rxjs/operators';

import {$activeSpec} from '../core/active-spec';
import {TriggerEvent} from '../core/trigger-event';
import {triggerSpecParser, TriggerType} from '../core/trigger-spec';
import {ContainerSpec} from '../types/container-spec';

import {ActionContext, getObject$} from './action-context';
import {ActionSpec, ConfigSpecs, TriggerConfig} from './action-spec';
import {moveObject} from './util/move-object';


export enum PositioningType {
  DEFAULT = 'default',
}


export interface Config extends TriggerConfig {
  readonly positioning: PositioningType;
}

function action(context: ActionContext<ContainerSpec<'indexed'>, Config>): OperatorFunction<TriggerEvent, unknown> {
  const moveObjectFn$ = combineLatest([
    getObject$(context),
    $activeSpec.get(context.vine),
    context.config$,
  ])
      .pipe(
          switchMap(([toState, activeState, config]) => {
            if (!toState || !activeState) {
              return of(null);
            }

            return $stateService.get(context.vine).resolve(activeState.$contentSpecs).pipe(
                switchMap(activeContents => {
                  const normalizedActiveContents = activeContents ?? [];
                  const movedObjectSpec = normalizedActiveContents[normalizedActiveContents.length - 1];
                  if (!movedObjectSpec) {
                    return of(null);
                  }

                  return moveObject(
                      activeState,
                      toState,
                      context.vine,
                  )
                      .pipe(
                          map(fn => {
                            if (!fn) {
                              return null;
                            }

                            return () => {
                              fn(movedObjectSpec.objectId, {index: locate(config.positioning)});
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

function locate(positioning: PositioningType): number {
  switch (positioning) {
    case PositioningType.DEFAULT:
      return 0;
  }
}

const DEFAULT_CONFIG: Config = {
  positioning: PositioningType.DEFAULT,
  trigger: TriggerType.D,
};

export function dropAction(
    defaultOverride: Partial<Config>,
    configSpecsOverride: Partial<ConfigSpecs<Config>> = {},
): ActionSpec<Config> {
  const defaultConfig = {...DEFAULT_CONFIG, ...defaultOverride};
  return {
    action,
    actionName: 'Drop',
    configSpecs: {
      trigger: attributeIn('pb-drop-trigger', triggerSpecParser(), defaultConfig.trigger),
      positioning: attributeIn(
          'pb-drop-positioning',
          enumParser<PositioningType>(PositioningType),
          defaultConfig.positioning,
      ),
      ...configSpecsOverride,
    },
  };
}
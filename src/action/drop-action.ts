import {$stateService} from 'grapevine';
import {attributeIn, enumParser} from 'persona';
import {combineLatest, of} from 'rxjs';
import {map, switchMap, tap, withLatestFrom} from 'rxjs/operators';

import {$activeSpec} from '../core/active-spec';
import {triggerSpecParser, TriggerType} from '../core/trigger-spec';
import {IsContainer} from '../payload/is-container';

import {getObject$} from './action-context';
import {Action, ActionSpec, ConfigSpecs, TriggerConfig, UnresolvedConfigSpecs} from './action-spec';
import {moveObject} from './util/move-object';
import {createTrigger} from './util/setup-trigger';


export enum PositioningType {
  DEFAULT = 'default',
}


export interface Config extends TriggerConfig {
  readonly positioning: PositioningType;
}

function actionFactory(config: ConfigSpecs<Config>): Action<IsContainer<'indexed'>> {
  return context => {
    const vine = context.personaContext.vine;
    const moveObjectFn$ = combineLatest([
      getObject$(context),
      $activeSpec.get(vine),
    ])
        .pipe(
            switchMap(([toState, activeState]) => {
              if (!toState || !activeState) {
                return of(null);
              }

              return $stateService.get(vine).resolve(activeState.$contentSpecs).pipe(
                  switchMap(activeContents => {
                    const normalizedActiveContents = activeContents ?? [];
                    const movedObjectSpec = normalizedActiveContents[normalizedActiveContents.length - 1];
                    if (!movedObjectSpec) {
                      return of(null);
                    }

                    return moveObject(
                        activeState,
                        toState,
                        vine,
                    )
                        .pipe(
                            map(fn => {
                              if (!fn) {
                                return null;
                              }

                              return (config: Config) => {
                                fn(movedObjectSpec.objectId, {index: locate(config.positioning)});
                              };
                            }),
                        );
                  }),
              );
            }),
        );
    return createTrigger(config, context.personaContext).pipe(
        withLatestFrom(moveObjectFn$),
        tap(([{config}, moveObjectFn]) => {
          if (!moveObjectFn) {
            return;
          }

          moveObjectFn(config);
        }),
    );
  };
}

function locate(positioning: PositioningType): number {
  switch (positioning) {
    case PositioningType.DEFAULT:
      return 0;
  }
}

const DEFAULT_CONFIG: Config = {
  positioning: PositioningType.DEFAULT,
  trigger: {type: TriggerType.D},
};

export function dropActionConfigSpecs(defaultOverride: Partial<Config>): UnresolvedConfigSpecs<Config> {
  const defaultConfig = {...DEFAULT_CONFIG, ...defaultOverride};
  return {
    trigger: attributeIn('pb-drop-trigger', triggerSpecParser(), defaultConfig.trigger),
    positioning: attributeIn(
        'pb-drop-positioning',
        enumParser<PositioningType>(PositioningType),
        defaultConfig.positioning,
    ),
  };
}

export function dropAction(configSpecs: ConfigSpecs<Config>): ActionSpec<Config> {
  return {
    action: actionFactory(configSpecs),
    actionName: 'Drop',
    configSpecs,
  };
}
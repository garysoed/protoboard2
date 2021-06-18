import {$resolveStateOp, $stateService} from 'grapevine';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {attributeIn, integerParser, PersonaContext} from 'persona';
import {Observable, of} from 'rxjs';
import {switchMap, take, withLatestFrom} from 'rxjs/operators';

import {triggerSpecParser, TriggerType} from '../core/trigger-spec';
import {IsMultifaced} from '../payload/is-multifaced';

import {Action, ActionSpec, TriggerConfig, UnresolvedConfigSpecs} from './action-spec';
import {ObjectIdObs} from './object-id-obs';
import {createTrigger} from './util/setup-trigger';


export interface Config extends TriggerConfig {
  readonly count: number;
}

export const KEY = 'flip';

function actionFactory(
    config$: Observable<Config>,
    objectId$: ObjectIdObs<IsMultifaced>,
    personaContext: PersonaContext,
): Action {
  return () => {
    const stateService = $stateService.get(personaContext.vine);
    return config$.pipe(
        createTrigger(personaContext),
        withLatestFrom(config$, objectId$.pipe($resolveStateOp.get(personaContext.vine)())),
        switchMap(([, config, obj]) => {
          if (!obj) {
            return of(null);
          }

          const faceCount = config.count;

          // TODO: Fix
          const $faceIndex = obj.$currentFaceIndex;
          return stateService.resolve($faceIndex).pipe(
              take(1),
              filterNonNullable(),
              stateService.modifyOperator((x, faceIndex) => x.set(
                  $faceIndex,
                  ((faceIndex ?? 0) + Math.floor(faceCount / 2)) % faceCount,
              )),
          );
        }),
    );
  };
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

export function flipAction(
    config$: Observable<Config>,
    objectId$: ObjectIdObs<IsMultifaced>,
    context: PersonaContext,
): ActionSpec<Config> {
  return {
    action: actionFactory(config$, objectId$, context),
    actionName: 'Flip',
    config$,
    trigger$: config$.pipe(createTrigger(context)),
  };
}

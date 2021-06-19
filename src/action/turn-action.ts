import {$resolveStateOp, $stateService} from 'grapevine';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {attributeIn, integerParser, PersonaContext} from 'persona';
import {Observable, of, pipe} from 'rxjs';
import {switchMap, take, withLatestFrom} from 'rxjs/operators';

import {triggerSpecParser, TriggerType} from '../core/trigger-spec';
import {IsMultifaced} from '../payload/is-multifaced';

import {Action, ActionSpec, TriggerConfig, UnresolvedConfigSpecs} from './action-spec';
import {ObjectIdObs} from './object-id-obs';
import {createTrigger} from './util/setup-trigger';


export interface Config extends TriggerConfig {
  readonly count: number;
}

export const KEY = 'turn';

function actionFactory(
    config$: Observable<Config>,
    objectId$: ObjectIdObs<IsMultifaced>,
    personaContext: PersonaContext,
): Action {
  const stateService = $stateService.get(personaContext.vine);
  return pipe(
      withLatestFrom(config$, objectId$.pipe($resolveStateOp.get(personaContext.vine)())),
      switchMap(([, config, obj]) => {
        if (!obj) {
          return of(null);
        }

        const faceCount = config.count;
        const $faceIndex = obj.$currentFaceIndex;
        return stateService.resolve($faceIndex).pipe(
            take(1),
            filterNonNullable(),
            stateService.modifyOperator((x, faceIndex) => {
              x.set($faceIndex, ((faceIndex ?? 0) + 1) % faceCount);
            }),
        );
      }),
  );
}

const DEFAULT_CONFIG: Config = {
  count: 1,
  trigger: {type: TriggerType.T},
};


export function turnActionConfigSpecs(defaultOverride: Partial<Config>): UnresolvedConfigSpecs<Config> {
  const defaultConfig = {...DEFAULT_CONFIG, ...defaultOverride};
  return {
    count: attributeIn('pb-turn-count', integerParser(), defaultConfig.count),
    trigger: attributeIn('pb-turn-trigger', triggerSpecParser(), defaultConfig.trigger),
  };
}


export function turnAction(
    config$: Observable<Config>,
    objectId$: ObjectIdObs<IsMultifaced>,
    context: PersonaContext,
): ActionSpec<Config> {
  return {
    action: actionFactory(config$, objectId$, context),
    actionName: 'Turn',
    config$,
    trigger$: config$.pipe(createTrigger(context)),
  };
}

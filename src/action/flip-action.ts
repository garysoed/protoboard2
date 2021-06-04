import {$stateService} from 'grapevine';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {attributeIn, integerParser} from 'persona';
import {of} from 'rxjs';
import {switchMap, take, withLatestFrom} from 'rxjs/operators';

import {triggerSpecParser, TriggerType} from '../core/trigger-spec';
import {IsMultifaced} from '../payload/is-multifaced';

import {getObject$} from './action-context';
import {Action, ActionSpec, ConfigSpecs, TriggerConfig, UnresolvedConfigSpecs} from './action-spec';
import {createTrigger} from './util/setup-trigger';


export interface Config extends TriggerConfig {
  readonly count: number;
}

export const KEY = 'flip';

function actionFactory(configSpecs: ConfigSpecs<Config>): Action<IsMultifaced> {
  return context => {
    const stateService = $stateService.get(context.personaContext.vine);
    return createTrigger(configSpecs, context.personaContext).pipe(
        withLatestFrom(getObject$(context)),
        switchMap(([{config}, obj]) => {
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
  trigger: TriggerType.F,
};

export function flipActionConfigSpecs(defaultOverride: Partial<Config>): UnresolvedConfigSpecs<Config> {
  const defaultConfig = {...DEFAULT_CONFIG, ...defaultOverride};
  return {
    count: attributeIn('pb-flip-count', integerParser(), defaultConfig.count),
    trigger: attributeIn('pb-flip-trigger', triggerSpecParser(), defaultConfig.trigger),
  };
}

export function flipAction(configSpecs: ConfigSpecs<Config>): ActionSpec<Config> {
  return {
    action: actionFactory(configSpecs),
    actionName: 'Flip',
    configSpecs,
  };
}

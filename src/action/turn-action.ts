import {$stateService} from 'grapevine';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {attributeIn, integerParser} from 'persona';
import {of as observableOf} from 'rxjs';
import {switchMap, take, withLatestFrom} from 'rxjs/operators';

import {triggerSpecParser, TriggerType} from '../core/trigger-spec';
import {IsMultifaced} from '../payload/is-multifaced';

import {getObject$} from './action-context';
import {Action, ActionSpec, ConfigSpecs, TriggerConfig, UnresolvedConfigSpecs} from './action-spec';
import {createTrigger} from './util/setup-trigger';


export interface Config extends TriggerConfig {
  readonly count: number;
}

export const KEY = 'turn';

function actionFactory(configSpecs: ConfigSpecs<Config>): Action<IsMultifaced> {
  return context => {
    const stateService = $stateService.get(context.personaContext.vine);
    return createTrigger(configSpecs, context.personaContext).pipe(
        withLatestFrom(getObject$(context)),
        switchMap(([{config}, obj]) => {
          if (!obj) {
            return observableOf(null);
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
  };
}

const DEFAULT_CONFIG: Config = {
  count: 1,
  trigger: TriggerType.T,
};


export function turnActionConfigSpecs(defaultOverride: Partial<Config>): UnresolvedConfigSpecs<Config> {
  const defaultConfig = {...DEFAULT_CONFIG, ...defaultOverride};
  return {
    count: attributeIn('pb-turn-count', integerParser(), defaultConfig.count),
    trigger: attributeIn('pb-turn-trigger', triggerSpecParser(), defaultConfig.trigger),
  };
}


export function turnAction(configSpecs: ConfigSpecs<Config>): ActionSpec<Config> {
  return {
    action: actionFactory(configSpecs),
    actionName: 'Turn',
    configSpecs,
  };
}

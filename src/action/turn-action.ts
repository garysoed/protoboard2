import {$stateService} from 'grapevine';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {attributeIn, integerParser} from 'persona';
import {of as observableOf} from 'rxjs';
import {map, switchMap, take, withLatestFrom} from 'rxjs/operators';

import {triggerSpecParser, TriggerType} from '../core/trigger-spec';
import {IsMultifaced} from '../payload/is-multifaced';

import {getObject$} from './action-context';
import {Action, ActionSpec, ConfigSpecs, TriggerConfig, UnresolvedConfigSpecs} from './action-spec';
import {createTrigger} from './util/setup-trigger';


export interface Config extends TriggerConfig {
  readonly count: number;
}

export const KEY = 'turn';

function actionFactory(configSpecs: ConfigSpecs<Config>): Action<IsMultifaced, Config> {
  return context => {
    const stateService = $stateService.get(context.vine);
    const faceCount$ = context.config$.pipe(map(config => config.count));
    return createTrigger(configSpecs, context.personaContext).pipe(
        withLatestFrom(getObject$(context), faceCount$),
        switchMap(([, obj, faceCount]) => {
          if (!obj) {
            return observableOf(null);
          }

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

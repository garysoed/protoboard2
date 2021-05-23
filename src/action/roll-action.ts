import {$stateService} from 'grapevine';
import {attributeIn, integerParser} from 'persona';
import {OperatorFunction, pipe} from 'rxjs';
import {map, tap, withLatestFrom} from 'rxjs/operators';

import {TriggerEvent} from '../core/trigger-event';
import {triggerSpecParser, TriggerType} from '../core/trigger-spec';
import {IsMultifaced} from '../payload/is-multifaced';

import {ActionContext, getObject$} from './action-context';
import {ActionSpec, ConfigSpecs, TriggerConfig} from './action-spec';
import {$random} from './util/random';


export interface Config extends TriggerConfig {
  readonly count: number;
}

function action(context: ActionContext<IsMultifaced, Config>): OperatorFunction<TriggerEvent, unknown> {
  const faceCount$ = context.config$.pipe(map(config => config.count));
  return pipe(
      withLatestFrom(getObject$(context), faceCount$),
      tap(([, obj, faceCount]) => {
        if (!obj) {
          return;
        }

        const randomValue = $random.get(context.vine).next();
        if (randomValue === null) {
          throw new Error('Random produced no values');
        }
        const nextIndex = Math.floor(randomValue * faceCount);
        $stateService.get(context.vine).modify(x => x.set(obj.$currentFaceIndex, nextIndex));
      }),
  );
}

const DEFAULT_CONFIG: Config = {
  count: 1,
  trigger: TriggerType.L,
};


export function rollAction(
    defaultOverride: Partial<Config> = {},
    configSpecsOverride: Partial<ConfigSpecs<Config>> = {},
): ActionSpec<Config> {
  const defaultConfig = {...DEFAULT_CONFIG, ...defaultOverride};
  return {
    action,
    actionName: 'Roll',
    configSpecs: {
      count: attributeIn('pb-roll-count', integerParser(), defaultConfig.count),
      trigger: attributeIn('pb-roll-trigger', triggerSpecParser(), defaultConfig.trigger),
      ...configSpecsOverride,
    },
  };
}
import {$stateService} from 'grapevine';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {attributeIn, integerParser} from 'persona';
import {of, OperatorFunction, pipe} from 'rxjs';
import {map, switchMap, take, withLatestFrom} from 'rxjs/operators';

import {TriggerEvent} from '../core/trigger-event';
import {triggerSpecParser, TriggerType} from '../core/trigger-spec';
import {IsMultifaced} from '../payload/is-multifaced';

import {ActionContext, getObject$} from './action-context';
import {ActionSpec, ConfigSpecs, TriggerConfig} from './action-spec';


export interface Config extends TriggerConfig {
  readonly count: number;
}

export const KEY = 'flip';

function action(context: ActionContext<IsMultifaced, Config>): OperatorFunction<TriggerEvent, unknown> {
  const stateService = $stateService.get(context.vine);
  const faceCount$ = context.config$.pipe(map(config => config.count));
  return pipe(
      withLatestFrom(getObject$(context), faceCount$),
      switchMap(([, obj, faceCount]) => {
        if (!obj) {
          return of(null);
        }

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
}

const DEFAULT_CONFIG: Config = {
  count: 1,
  trigger: TriggerType.F,
};

export function flipAction(
    defaultOverride: Partial<Config> = {},
    configSpecsOverride: Partial<ConfigSpecs<Config>> = {},
): ActionSpec<Config> {
  const defaultConfig = {...DEFAULT_CONFIG, ...defaultOverride};
  return {
    action,
    actionName: 'Flip',
    configSpecs: {
      count: attributeIn('pb-flip-count', integerParser(), defaultConfig.count),
      trigger: attributeIn('pb-flip-trigger', triggerSpecParser(), defaultConfig.trigger),
      ...configSpecsOverride,
    },
  };
}

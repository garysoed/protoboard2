import {$stateService} from 'grapevine';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {attributeIn, integerParser} from 'persona';
import {of as observableOf, OperatorFunction, pipe} from 'rxjs';
import {map, switchMap, take, withLatestFrom} from 'rxjs/operators';

import {TriggerEvent} from '../core/trigger-event';
import {UnreservedTriggerSpec} from '../core/trigger-spec';
import {IsMultifaced} from '../payload/is-multifaced';
import {PieceSpec} from '../types/piece-spec';

import {ActionContext, getObject$} from './action-context';
import {ActionSpec, ConfigSpecs} from './action-spec';


export interface Config {
  readonly count: number;
}

export const KEY = 'turn';

function action(context: ActionContext<PieceSpec<IsMultifaced>, Config>): OperatorFunction<TriggerEvent, unknown> {
  const stateService = $stateService.get(context.vine);
  const faceCount$ = context.config$.pipe(map(config => config.count));
  return pipe(
      withLatestFrom(getObject$(context), faceCount$),
      switchMap(([, obj, faceCount]) => {
        if (!obj) {
          return observableOf(null);
        }

        const $faceIndex = obj.payload.$currentFaceIndex;
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


export function turnAction(
    defaultConfig: Config,
    trigger: UnreservedTriggerSpec,
    configSpecsOverride: Partial<ConfigSpecs<Config>> = {},
): ActionSpec<Config> {
  return {
    action,
    actionName: 'Turn',
    configSpecs: {
      count: attributeIn('pb-turn-count', integerParser(), defaultConfig.count),
      ...configSpecsOverride,
    },
    defaultConfig,
    trigger,
  };
}

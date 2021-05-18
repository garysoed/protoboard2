import {$stateService} from 'grapevine';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {integerParser} from 'persona';
import {of as observableOf, OperatorFunction, pipe} from 'rxjs';
import {map, switchMap, take, withLatestFrom} from 'rxjs/operators';

import {ActionContext, BaseAction, TriggerEvent} from '../core/base-action';
import {UnreservedTriggerSpec} from '../core/trigger-spec';
import {IsMultifaced} from '../payload/is-multifaced';
import {PieceSpec} from '../types/piece-spec';

import {ActionSpec} from './action-spec';


export interface Config {
  readonly count: number;
}

export const KEY = 'turn';

/**
 * Lets the user turn the object to reveal different faces.
 *
 * @thModule action
 */
class TurnAction extends BaseAction<PieceSpec<IsMultifaced>, Config> {
  constructor() {
    super(KEY, 'Turn', {count: integerParser()});
  }

  getOperator(context: ActionContext<PieceSpec<IsMultifaced>, Config>): OperatorFunction<TriggerEvent, unknown> {
    const stateService = $stateService.get(context.vine);
    const faceCount$ = context.config$.pipe(map(config => config.count));
    return pipe(
        withLatestFrom(this.getObject$(context), faceCount$),
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
}


export function turnAction(
    defaultConfig: Config,
    trigger: UnreservedTriggerSpec,
): ActionSpec<Config> {
  return {
    defaultConfig,
    trigger,
    action: new TurnAction(),
  };
}

import {$stateService} from 'grapevine';
import {integerParser} from 'persona';
import {OperatorFunction, pipe} from 'rxjs';
import {map, tap, withLatestFrom} from 'rxjs/operators';

import {ActionContext, BaseAction, TriggerEvent} from '../core/base-action';
import {UnreservedTriggerSpec} from '../core/trigger-spec';
import {IsMultifaced} from '../payload/is-multifaced';
import {PieceSpec} from '../types/piece-spec';

import {ActionSpec} from './action-spec';
import {$random} from './util/random';


export interface Config {
  readonly count: number;
}

/**
 * Lets the user pick a random face of the object
 */
class RollAction extends BaseAction<PieceSpec<IsMultifaced>, Config> {
  constructor() {
    super('roll', 'Roll', {count: integerParser()});
  }

  getOperator(context: ActionContext<PieceSpec<IsMultifaced>, Config>): OperatorFunction<TriggerEvent, unknown> {
    const faceCount$ = context.config$.pipe(map(config => config.count));
    return pipe(
        withLatestFrom(this.getObject$(context), faceCount$),
        tap(([, obj, faceCount]) => {
          if (!obj) {
            return;
          }

          const randomValue = $random.get(context.vine).next();
          if (randomValue === null) {
            throw new Error('Random produced no values');
          }
          const nextIndex = Math.floor(randomValue * faceCount);
          $stateService.get(context.vine).modify(x => x.set(obj.payload.$currentFaceIndex, nextIndex));
        }),
    );
  }
}

export function rollAction(
    defaultConfig: Config,
    trigger: UnreservedTriggerSpec,
): ActionSpec<Config> {
  return {
    defaultConfig,
    trigger,
    action: new RollAction(),
  };
}
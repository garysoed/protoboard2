import {$stateService} from 'grapevine';
import {extend} from 'gs-tools/export/rxjs';
import {integerParser} from 'persona';
import {OperatorFunction, pipe} from 'rxjs';
import {map, tap, withLatestFrom} from 'rxjs/operators';

import {BaseAction, OperatorContext, TriggerEvent} from '../core/base-action';
import {IsMultifaced} from '../payload/is-multifaced';
import {PieceSpec} from '../types/piece-spec';

import {$random} from './util/random';


export interface Config {
  readonly count: number;
}

/**
 * Lets the user pick a random face of the object
 */
export class RollAction extends BaseAction<PieceSpec<IsMultifaced>, Config> {
  constructor(
      private readonly defaultConfig: Config,
  ) {
    super(
        'roll',
        'Roll',
        {count: integerParser()},
    );
  }

  getOperator(context: OperatorContext<PieceSpec<IsMultifaced>, Config>): OperatorFunction<TriggerEvent, unknown> {
    const faceCount$ = context.config$.pipe(
        extend(this.defaultConfig),
        map(config => config.count),
    );
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

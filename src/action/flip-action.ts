import {$stateService} from 'grapevine';
import {extend, filterNonNullable} from 'gs-tools/export/rxjs';
import {integerParser} from 'persona';
import {of, OperatorFunction, pipe} from 'rxjs';
import {map, switchMap, take, withLatestFrom} from 'rxjs/operators';

import {BaseAction, ActionContext, TriggerEvent} from '../core/base-action';
import {IsMultifaced} from '../payload/is-multifaced';
import {PieceSpec} from '../types/piece-spec';


export interface Config {
  readonly count: number;
}

export const KEY = 'flip';

/**
 * Lets the user flip the object to reveal the opposite face.
 *
 * @remarks
 * This is only applicable if there is an even number of faces on the object.
 *
 * @thModule action
 */
export class FlipAction extends BaseAction<PieceSpec<IsMultifaced>, Config> {
  constructor(
      private readonly defaultConfig: Config,
  ) {
    super(KEY, 'Flip', {count: integerParser()});
  }

  getOperator(context: ActionContext<PieceSpec<IsMultifaced>, Config>): OperatorFunction<TriggerEvent, unknown> {
    const stateService = $stateService.get(context.vine);
    const faceCount$ = context.config$.pipe(
        extend(this.defaultConfig),
        map(config => config.count),
    );
    return pipe(
        withLatestFrom(this.getObject$(context), faceCount$),
        switchMap(([, obj, faceCount]) => {
          if (!obj) {
            return of(null);
          }

          // TODO: Fix
          const $faceIndex = obj.payload.$currentFaceIndex;
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
}

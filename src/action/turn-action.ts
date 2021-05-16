import {$stateService} from 'grapevine';
import {extend, filterNonNullable} from 'gs-tools/export/rxjs';
import {integerParser} from 'persona';
import {of as observableOf, OperatorFunction, pipe} from 'rxjs';
import {map, switchMap, take, withLatestFrom} from 'rxjs/operators';

import {ActionContext, BaseAction, OperatorContext, TriggerEvent} from '../core/base-action';
import {IsMultifaced} from '../payload/is-multifaced';
import {PieceSpec} from '../types/piece-spec';


export interface Config {
  readonly count: number;
}

export const KEY = 'turn';

/**
 * Lets the user turn the object to reveal different faces.
 *
 * @thModule action
 */
export class TurnAction extends BaseAction<PieceSpec<IsMultifaced>, Config> {
  constructor(
      context: ActionContext<PieceSpec<IsMultifaced>>,
      private readonly defaultConfig: Config,
  ) {
    super(
        KEY,
        'Turn',
        {count: integerParser()},
        context,
    );
  }

  getOperator(context: OperatorContext<Config>): OperatorFunction<TriggerEvent, unknown> {
    const stateService = $stateService.get(this.vine);
    const faceCount$ = context.config$.pipe(
        extend(this.defaultConfig),
        map(config => config.count),
    );
    return pipe(
        withLatestFrom(this.objectSpec$, faceCount$),
        switchMap(([, objectSpec, faceCount]) => {
          if (!objectSpec) {
            return observableOf(null);
          }

          const $faceIndex = objectSpec.payload.$currentFaceIndex;
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

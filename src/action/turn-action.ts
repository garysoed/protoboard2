import {$stateService} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {integerParser} from 'persona';
import {Observable, of as observableOf, OperatorFunction, pipe} from 'rxjs';
import {map, switchMap, take, withLatestFrom} from 'rxjs/operators';

import {ActionContext, BaseAction, TriggerEvent} from '../core/base-action';
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
      context: ActionContext<PieceSpec<IsMultifaced>, Config>,
      defaultConfig: Config,
  ) {
    super(
        KEY,
        'Turn',
        {count: integerParser()},
        context,
        defaultConfig,
    );
  }

  @cache()
  private get faceCount$(): Observable<number> {
    return this.config$.pipe(map(config => config.count));
  }

  @cache()
  get operator(): OperatorFunction<TriggerEvent, unknown> {
    const stateService = $stateService.get(this.vine);
    return pipe(
        withLatestFrom(this.objectSpec$, this.faceCount$),
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

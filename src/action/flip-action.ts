import {$stateService} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {integerParser} from 'persona';
import {Observable, of as observableOf} from 'rxjs';
import {map, switchMap, take, withLatestFrom} from 'rxjs/operators';

import {ActionContext, BaseAction} from '../core/base-action';
import {IsMultifaced} from '../payload/is-multifaced';
import {PieceSpec} from '../types/piece-spec';


interface Config {
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
      context: ActionContext<PieceSpec<IsMultifaced>>,
      defaultConfig: Config,
  ) {
    super(
        KEY,
        'Flip',
        {count: integerParser()},
        context,
        defaultConfig,
    );

    this.addSetup(this.handleTrigger$);
  }

  @cache()
  private get handleTrigger$(): Observable<unknown> {
    const stateService = $stateService.get(this.vine);
    return this.onTrigger$.pipe(
        withLatestFrom(this.objectSpec$, this.faceCount$),
        switchMap(([, objectSpec, faceCount]) => {
          if (!objectSpec) {
            return observableOf(null);
          }

          // TODO: Fix
          const $faceIndex = objectSpec.payload.$currentFaceIndex;
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

  @cache()
  private get faceCount$(): Observable<number> {
    return this.config$.pipe(map(config => config.count));
  }
}

import {$stateService} from 'grapevine';
import { $first, $pipe } from 'gs-tools/export/collect';
import {cache} from 'gs-tools/export/data';
import {integerParser} from 'persona';
import {Observable} from 'rxjs';
import {map, tap, withLatestFrom} from 'rxjs/operators';

import {ActionContext, BaseAction} from '../core/base-action';
import {IsMultifaced} from '../payload/is-multifaced';
import {PieceSpec} from '../types/piece-spec';

import {$random} from './util/random';


interface Config {
  readonly count: number;
}

/**
 * Lets the user pick a random face of the object
 */
export class RollAction extends BaseAction<PieceSpec<IsMultifaced>, Config> {
  constructor(
      context: ActionContext<PieceSpec<IsMultifaced>>,
      defaultConfig: Config,
  ) {
    super(
        'roll',
        'Roll',
        {count: integerParser()},
        context,
        defaultConfig,
    );

    this.addSetup(this.handleTrigger$);
  }

  @cache()
  private get handleTrigger$(): Observable<unknown> {
    return this.onTrigger$.pipe(
        withLatestFrom(
            this.objectSpec$,
            this.faceCount$,
        ),
        tap(([, objectSpec, faceCount]) => {
          if (!objectSpec) {
            return;
          }

          const randomValue = $pipe($random.get(this.vine), $first());
          if (randomValue === null) {
            throw new Error('Random produced no values');
          }
          const nextIndex = Math.floor(randomValue * faceCount);
          $stateService.get(this.vine).modify(x => x.set(objectSpec.payload.$currentFaceIndex, nextIndex));
        }),
    );
  }

  @cache()
  private get faceCount$(): Observable<number> {
    return this.config$.pipe(map(config => config.count));
  }
}

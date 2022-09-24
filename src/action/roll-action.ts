import {asRandom} from 'gs-tools/export/random';
import {filterNonNullable, walkObservable} from 'gs-tools/export/rxjs';
import {Context} from 'persona';
import {OperatorFunction, pipe} from 'rxjs';
import {map, withLatestFrom} from 'rxjs/operators';

import {BaseComponentSpecType} from '../core/base-component';
import {IsMultifaced} from '../types/is-multifaced';
import {$random, $randomSeed} from '../util/random';


export function rollAction(
    $: Context<BaseComponentSpecType<IsMultifaced>>,
): OperatorFunction<unknown, unknown> {
  const stateWalker = walkObservable($.host.state.pipe(filterNonNullable()));
  const faces$ = stateWalker._('faces');
  return pipe(
      withLatestFrom(faces$),
      map(([, faces]) => {
        return $random.get($.vine).take(randomValue => {
          return asRandom(Math.floor(randomValue * faces.length));
        }).run($randomSeed.get($.vine)());
      }),
      stateWalker.$('currentFaceIndex').set(),
  );
}

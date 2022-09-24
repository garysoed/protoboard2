import {shuffle} from 'gs-tools/export/random';
import {filterNonNullable, walkObservable} from 'gs-tools/export/rxjs';
import {Context} from 'persona';
import {OperatorFunction, pipe} from 'rxjs';
import {map, withLatestFrom} from 'rxjs/operators';

import {BaseComponentSpecType} from '../core/base-component';
import {IsContainer} from '../types/is-container';
import {$random, $randomSeed} from '../util/random';


export function shuffleAction(
    $: Context<BaseComponentSpecType<IsContainer>>,
): OperatorFunction<unknown, unknown> {
  const state$ = walkObservable($.host.state.pipe(filterNonNullable()));
  const contentIds$ = state$.$('contentIds');
  return pipe(
      withLatestFrom(contentIds$),
      map(([, contentIds]) => {
        return shuffle(contentIds, $random.get($.vine)).run($randomSeed.get($.vine)());
      }),
      filterNonNullable(),
      contentIds$.set(),
  );
}

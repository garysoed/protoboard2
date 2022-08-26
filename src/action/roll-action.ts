import {asRandom} from 'gs-tools/export/random2';
import {flattenResolver} from 'gs-tools/export/state';
import {Context} from 'persona';
import {OperatorFunction, pipe} from 'rxjs';
import {map, withLatestFrom} from 'rxjs/operators';

import {BaseComponentSpecType} from '../core/base-component';
import {IsMultifaced} from '../types/is-multifaced';
import {$random, $randomSeed} from '../util/random';


export function rollAction(
    $: Context<BaseComponentSpecType<IsMultifaced>>,
): OperatorFunction<unknown, unknown> {
  const state$ = flattenResolver($.host.state);
  const faces$ = state$._('faces');
  return pipe(
      withLatestFrom(faces$),
      map(([, faces]) => {
        return $random.get($.vine).take(randomValue => {
          return asRandom(Math.floor(randomValue * faces.length));
        }).run($randomSeed.get($.vine)());
      }),
      state$.$('currentFaceIndex').set(),
  );
}

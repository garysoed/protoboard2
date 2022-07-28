import {flattenResolver} from 'gs-tools/export/state';
import {Context} from 'persona';
import {OperatorFunction, pipe} from 'rxjs';
import {map, withLatestFrom} from 'rxjs/operators';

import {BaseComponentSpecType} from '../core/base-component';
import {IsMultifaced} from '../types/is-multifaced';
import {$random} from '../util/random';


export function rollAction(
    $: Context<BaseComponentSpecType<IsMultifaced>>,
): OperatorFunction<unknown, unknown> {
  const state$ = flattenResolver($.host.state);
  const faces$ = state$._('faces');
  return pipe(
      withLatestFrom(faces$),
      map(([, faces]) => {
        const randomValue = $random.get($.vine).next();
        if (randomValue === null) {
          throw new Error('Random produced no values');
        }
        return Math.floor(randomValue * faces.length);
      }),
      state$.$('currentFaceIndex').set(),
  );
}

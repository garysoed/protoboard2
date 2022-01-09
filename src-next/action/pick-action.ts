import {Context} from 'persona';
import {Spec} from 'persona/export/internal';
import {Observable, OperatorFunction, pipe} from 'rxjs';
import {map, withLatestFrom} from 'rxjs/operators';

import {$activeState} from '../core/active-spec';


export function pickAction(
    $: Context<Spec>,
    id$: Observable<{}>,
): OperatorFunction<unknown, unknown> {
  const activeState = $activeState.get($.vine);
  return pipe(
      withLatestFrom(id$, activeState.$('contentIds')),
      map(([, id, contentIds]) => {
        return [...contentIds, id];
      }),
      activeState.$('contentIds').set(),
  );
}

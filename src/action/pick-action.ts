import {filterNonNullable, forwardTo, walkObservable} from 'gs-tools/export/rxjs';
import {Context} from 'persona';
import {OperatorFunction, pipe} from 'rxjs';
import {map, withLatestFrom} from 'rxjs/operators';

import {$activeState} from '../core/active-spec';
import {BaseComponentSpecType} from '../core/base-component';
import {ComponentState} from '../types/component-state';


export function pickAction(
    $: Context<BaseComponentSpecType<ComponentState>>,
): OperatorFunction<unknown, unknown> {
  const activeState = $activeState.get($.vine);
  return pipe(
      withLatestFrom(
          walkObservable($.host.state.pipe(filterNonNullable()))._('id'),
          activeState.contentIds,
      ),
      map(([, id, contentIds]) => {
        return [...contentIds, id];
      }),
      forwardTo(activeState.contentIds),
  );
}

import {filterNonNullable, walkObservable} from 'gs-tools/export/rxjs';
import {Context} from 'persona';
import {of, OperatorFunction, pipe} from 'rxjs';
import {map, switchMap, withLatestFrom} from 'rxjs/operators';

import {$activeState} from '../core/active-spec';
import {BaseComponentSpecType} from '../core/base-component';
import {IsContainer} from '../types/is-container';


export function dropAction($: Context<BaseComponentSpecType<IsContainer>>): OperatorFunction<unknown, unknown> {
  const activeState = $activeState.get($.vine);
  const activeContentIds = activeState.contentIds;
  const regionContentIds = walkObservable($.host.state.pipe(filterNonNullable())).$('contentIds');
  return pipe(
      withLatestFrom(regionContentIds, activeContentIds),
      map(([, regionIds, activeIds]) => {
        const newActiveIds = [...activeIds];
        const [droppedId] = newActiveIds.splice(0, 1);
        if (droppedId === undefined) {
          return null;
        }

        return {
          regionContents: [...regionIds, droppedId],
          activeContents: newActiveIds,
        };
      }),
      filterNonNullable(),
      switchMap(({activeContents, regionContents}) => {
        activeContentIds.next(activeContents);
        return of(regionContents).pipe(regionContentIds.set());
      }),
  );
}

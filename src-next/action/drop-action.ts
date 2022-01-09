import {filterNonNullable} from 'gs-tools/export/rxjs';
import {flattenResolver} from 'gs-tools/export/state';
import {Context} from 'persona';
import {concat, of, OperatorFunction, pipe} from 'rxjs';
import {map, switchMap, withLatestFrom} from 'rxjs/operators';

import {$activeState} from '../core/active-spec';
import {BaseComponentSpecType} from '../core/base-component';
import {RegionState} from '../types/region-state';


export function dropAction($: Context<BaseComponentSpecType<RegionState>>): OperatorFunction<unknown, unknown> {
  const activeState = $activeState.get($.vine);
  const activeContentIds = activeState.$('contentIds');
  const regionContentIds = flattenResolver($.host.state).$('contentIds');
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
        return concat(
            of(activeContents).pipe(activeContentIds.set()),
            of(regionContents).pipe(regionContentIds.set()),
        );
      }),
  );
}

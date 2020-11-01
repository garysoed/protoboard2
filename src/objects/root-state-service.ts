import { $asMap, $map, $pipe } from 'gs-tools/export/collect';
import { $stateService } from 'mask';
import { StateId } from 'gs-tools/export/state';
import { combineLatest, of as observableOf } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { source, stream } from 'grapevine';

import { ObjectSpec } from './object-spec';
import { RootState } from './root-state';

export const $rootState = source<StateId<RootState>|null>(
    'objectSpecListId',
    () => null,
);

export const $objectSpecMap = stream<ReadonlyMap<string, ObjectSpec<any>>>(
    'objectSpecMap',
    vine => combineLatest([$rootState.get(vine), $stateService.get(vine)]).pipe(
        switchMap(([objectSpecId, stateService]) => {
          if (!objectSpecId) {
            return observableOf(null);
          }

          return stateService.get(objectSpecId);
        }),
        map(hasObjectSpecList => {
          if (!hasObjectSpecList) {
            return new Map();
          }

          return $pipe(
              hasObjectSpecList.objectSpecs,
              $map(spec => ([spec.id, spec] as [string, ObjectSpec<any>])),
              $asMap(),
          );
        }),
    ),
);

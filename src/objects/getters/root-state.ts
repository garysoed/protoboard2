import {stream} from 'grapevine';
import {$asMap, $map, $pipe} from 'gs-tools/export/collect';
import {$stateService} from 'mask';
import {combineLatest, of as observableOf} from 'rxjs';
import {map, switchMap, withLatestFrom} from 'rxjs/operators';

import {ActivePayload} from '../../core/active';
import {ObjectSpec} from '../object-spec';
import {$$rootState} from '../root-state';

export const $rootState = stream(
    'rootState',
    vine => {
      return combineLatest([
        $$rootState.get(vine),
        $stateService.get(vine),
      ])
          .pipe(
              switchMap(([$rootState, stateService]) => {
                if (!$rootState) {
                  return observableOf(null);
                }

                return stateService.get($rootState);
              }));
    },
);

export const $activeState = stream<ObjectSpec<ActivePayload>|null>(
    'activeState',
    vine => $rootState.get(vine).pipe(
        withLatestFrom($stateService.get(vine)),
        switchMap(([rootState, stateService]) => {
          if (!rootState) {
            return observableOf(null);
          }

          return stateService.get(rootState.$activeId);
        }),
    ),
);

type GetObjectSpec = <P>(id: string) => ObjectSpec<P>|null;
export const $getObjectSpec = stream<GetObjectSpec>(
    'getObjectSpec',
    vine => $objectSpecMap.get(vine).pipe(
        map(objectSpecMap => {
          return (id: string) => {
            return objectSpecMap.get(id) ?? null;
          };
        }),
    ),
);

export const $objectSpecIds = stream<ReadonlySet<string>>(
    'objectSpecIds',
    vine => $objectSpecMap.get(vine)
        .pipe(map(objectSpecMap => new Set([...objectSpecMap.keys()]))),
);

export const $objectSpecMap = stream<ReadonlyMap<string, ObjectSpec<any>>>(
    'objectSpecMap',
    vine => $rootState.get(vine).pipe(
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

import {$$rootState} from '../root-state';
import {$asMap, $map, $pipe} from 'gs-tools/export/collect';
import {$stateService} from 'mask';
import {ActivePayload} from '../../core/active';
import {ObjectSpec} from '../object-spec';
import {combineLatest, of as observableOf} from 'rxjs';
import {map, switchMap, withLatestFrom} from 'rxjs/operators';
import {stream} from 'grapevine';

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

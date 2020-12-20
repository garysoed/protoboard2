import {stream} from 'grapevine';
import {$asArray, $filterNonNull, $find, $map, $pipe} from 'gs-tools/export/collect';
import {StateId} from 'gs-tools/export/state';
import {$stateService} from 'mask';
import {combineLatest, of as observableOf} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {$getObjectSpec, $objectSpecIds} from '../../../src/objects/getters/root-state';
import {SUPPLY_TYPE} from '../../core/object-specs';
import {$demoStateId, DemoState} from '../types/demo-state';


export const $demoState = stream<DemoState|null>(
    'DemoState',
    vine => combineLatest([$stateService.get(vine), $demoStateId.get(vine)]).pipe(
        switchMap(([stateService, demoStateId]) => {
          if (!demoStateId) {
            return observableOf(null);
          }

          return stateService.get(demoStateId);
        }),
    ));

export const $isStaging = stream<boolean>(
    'isStaging',
    vine => combineLatest([$stateService.get(vine), $demoState.get(vine)]).pipe(
        switchMap(([stateService, demoState]) => {
          if (!demoState) {
            return observableOf(null);
          }

          return stateService.get(demoState.$isStaging);
        }),
        map(isStaging => isStaging ?? true),
    ),
);

export const $supplyId = stream<StateId<any>|null>(
    'supplyId',
    vine => combineLatest([$getObjectSpec.get(vine), $objectSpecIds.get(vine)]).pipe(
        switchMap(([getObjectSpec, objectSpecIds]) => {
          const object$list = $pipe(
              objectSpecIds,
              $map(objectSpecId => {
                return getObjectSpec(objectSpecId).pipe(
                    map(objectSpec => objectSpec ? [objectSpecId, objectSpec] as const : null),
                );
              }),
              $asArray(),
          );

          if (object$list.length <= 0) {
            return observableOf([]);
          }

          return combineLatest(object$list);
        }),
        map(objects => {
          return $pipe(
              objects,
              $filterNonNull(),
              $find(([, objectSpec]) => objectSpec.type === SUPPLY_TYPE),
          )?.[0] ?? null;
        }),
    ),
);

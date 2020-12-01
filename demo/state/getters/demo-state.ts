import {stream} from 'grapevine';
import {$filterNonNull, $find, $map, $pipe} from 'gs-tools/export/collect';
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
        map(([getObjectSpec, objectSpecIds]) => {
          return $pipe(
              objectSpecIds,
              $map(objectSpecId => {
                const objectSpec = getObjectSpec(objectSpecId);
                return objectSpec ? [objectSpecId, objectSpec] as const : null;
              }),
              $filterNonNull(),
              $find(([, objectSpec]) => objectSpec.type === SUPPLY_TYPE),
          )?.[0] ?? null;
        }),
    ),
);

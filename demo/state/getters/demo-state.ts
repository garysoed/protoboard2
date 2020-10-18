import { stream } from 'grapevine';
import { $stateService } from 'mask';
import { combineLatest, of as observableOf } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { $demoStateId, DemoState } from '../types/demo-state';


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

import {stream} from 'grapevine';
import {$stateService} from 'mask';
import {combineLatest, of as observableOf} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {$demoStateId, DemoState} from '../types/demo-state';


export const $demoState = stream<DemoState|undefined>(
    'DemoState',
    vine => combineLatest([$stateService.get(vine), $demoStateId.get(vine)]).pipe(
        switchMap(([stateService, demoStateId]) => {
          if (!demoStateId) {
            return observableOf(undefined);
          }

          return stateService.resolve(demoStateId).self$;
        }),
    ));

export const $isStaging = stream<boolean>(
    'isStaging',
    vine => combineLatest([$stateService.get(vine), $demoState.get(vine)]).pipe(
        switchMap(([stateService, demoState]) => {
          if (!demoState) {
            return observableOf(undefined);
          }

          return stateService.resolve(demoState.$isStaging).self$;
        }),
        map(isStaging => isStaging ?? true),
    ),
);

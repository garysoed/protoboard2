import {source} from 'grapevine';
import {$stateService} from 'grapevine';
import {Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {$demoStateId, DemoState} from '../types/demo-state';


export const $demoState = source<Observable<DemoState|undefined>>(
    'DemoState',
    vine => $demoStateId.get(vine).pipe(
        switchMap(demoStateId => {
          if (!demoStateId) {
            return of(undefined);
          }

          return $stateService.get(vine).resolve(demoStateId);
        }),
    ));

export const $isStaging = source<Observable<boolean>>(
    'isStaging',
    vine => $demoState.get(vine).pipe(
        switchMap(demoState => {
          if (!demoState) {
            return of(undefined);
          }

          return $stateService.get(vine).resolve(demoState.$isStaging);
        }),
        map(isStaging => isStaging ?? true),
    ),
);

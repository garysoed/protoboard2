import { stream } from 'grapevine';
import { $stateService } from 'mask';
import { combineLatest, of as observableOf } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { $demoState } from './demo-state';

export const $objectSpecs = stream(
    'objectSpecs',
    vine => {
      return combineLatest([$demoState.get(vine), $stateService.get(vine)]).pipe(
        switchMap(([demoState, stateService]) => {
          if (!demoState) {
            return observableOf(null);
          }

          return stateService.get(demoState.$playState);
        }),
        map(playState => playState?.objectSpecs ?? []),
      );
    },
);

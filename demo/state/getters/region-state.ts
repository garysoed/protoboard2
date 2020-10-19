import { stream } from 'grapevine';
import { $stateService } from 'mask';
import { combineLatest, of as observableOf } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { $demoState } from './demo-state';


export const $targetAreas = stream(
  'targetAreas',
  vine => {
    return combineLatest([$demoState.get(vine), $stateService.get(vine)]).pipe(
        switchMap(([demoState, stateService]) => {
          if (!demoState) {
            return observableOf(null);
          }

          const deck$ = stateService.get(demoState.regionEditorState.deck.$targetArea);
          return combineLatest([deck$]).pipe(
              map(([deck]) => {
                if (deck === null) {
                  return null;
                }

                return {deck};
              }),
          );
        }),
    );
  },
);
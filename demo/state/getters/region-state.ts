import {source} from 'grapevine';
import {$stateService} from 'mask';
import {combineLatest, of as observableOf} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {$demoState} from './demo-state';


export const $targetAreas = source(
    'targetAreas',
    vine => {
      return $demoState.get(vine).pipe(
          switchMap(demoState => {
            if (!demoState) {
              return observableOf(undefined);
            }

            const deck$ =  $stateService.get(vine).resolve(demoState.regionEditorState.deck.$targetArea);
            return combineLatest([deck$]).pipe(
                map(([deck]) => {
                  if (deck === undefined) {
                    return undefined;
                  }

                  return {deck};
                }),
            );
          }),
      );
    },
);

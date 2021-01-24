import {stream} from 'grapevine';
import {$stateService} from 'mask';
import {combineLatest, of as observableOf} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {$demoState} from '../getters/demo-state';


export const $stagingState = stream(
    'StagingState',
    vine => $demoState.get(vine).pipe(map(state => state?.stagingState)),
);

export const $pieceSpecs = stream(
    'pieceSpecs',
    vine => combineLatest([$stagingState.get(vine), $stateService.get(vine)]).pipe(
        switchMap(([stagingState, stateService]) => {
          if (!stagingState) {
            return observableOf(null);
          }

          return stateService.resolve(stagingState.$pieceSpecs);
        }),
    ),
);

export const $regionSpecs = stream(
    'regionSpecs',
    vine => combineLatest([$stagingState.get(vine), $stateService.get(vine)]).pipe(
        switchMap(([stagingState, stateService]) => {
          if (!stagingState) {
            return observableOf(null);
          }

          return stateService.resolve(stagingState.$regionSpecs);
        }),
    ),
);

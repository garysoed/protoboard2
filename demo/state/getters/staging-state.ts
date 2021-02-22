import {source} from 'grapevine';
import {$stateService} from 'mask';
import {of as observableOf} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {$demoState} from '../getters/demo-state';


export const $stagingState = source(
    'StagingState',
    vine => $demoState.get(vine).pipe(map(state => state?.stagingState)),
);

export const $pieceSpecs = source(
    'pieceSpecs',
    vine => $stagingState.get(vine).pipe(
        switchMap(stagingState => {
          if (!stagingState) {
            return observableOf(null);
          }

          return $stateService.get(vine).resolve(stagingState.$pieceSpecs);
        }),
    ),
);

export const $regionSpecs = source(
    'regionSpecs',
    vine => $stagingState.get(vine).pipe(
        switchMap(stagingState => {
          if (!stagingState) {
            return observableOf(null);
          }

          return $stateService.get(vine).resolve(stagingState.$regionSpecs);
        }),
    ),
);

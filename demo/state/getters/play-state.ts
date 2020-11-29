import {stream} from 'grapevine';
import {StateId} from 'gs-tools/export/state';
import {$stateService} from 'mask';
import {combineLatest, of as observableOf} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {ObjectSpec} from '../../../src/types/object-spec';
import {PiecePayload} from '../types/piece-payload';
import {RegionPayload} from '../types/region-payload';

import {$demoState} from './demo-state';


export const $objectSpecIds = stream<ReadonlyArray<StateId<ObjectSpec<PiecePayload|RegionPayload>>>>(
    'objectSpecIds',
    vine => {
      return combineLatest([$demoState.get(vine), $stateService.get(vine)]).pipe(
          switchMap(([demoState, stateService]) => {
            if (!demoState) {
              return observableOf(null);
            }

            return stateService.get(demoState.$playState);
          }),
          map(playState => playState?.objectSpecIds ?? []),
      );
    },
);

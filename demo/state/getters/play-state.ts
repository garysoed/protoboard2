import {stream} from 'grapevine';
import {StateId} from 'gs-tools/export/state';
import {$stateService} from 'mask';
import {combineLatest, of as observableOf} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {SlotSpec} from '../../../src/region/slot';
import {ObjectSpec} from '../../../src/types/object-spec';
import {PiecePayload} from '../types/piece-payload';
import {PlayState} from '../types/play-state';
import {RegionPayload} from '../types/region-payload';

import {$demoState} from './demo-state';


export const $playState = stream<PlayState|null>(
    'playState',
    vine => {
      return combineLatest([$demoState.get(vine), $stateService.get(vine)]).pipe(
          switchMap(([demoState, stateService]) => {
            if (!demoState) {
              return observableOf(null);
            }

            return stateService.get(demoState.$playState);
          }),
      );
    },
);
export const $objectSpecIds = stream<ReadonlyArray<StateId<ObjectSpec<PiecePayload|RegionPayload>>>>(
    'objectSpecIds',
    vine =>  $playState.get(vine).pipe(
        map(playState => playState?.objectSpecIds ?? []),
    ),
);


export const $supplyId = stream<StateId<SlotSpec<{}>>|null>(
    'supplyId',
    vine => $playState.get(vine).pipe(map(state => state?.$supply ?? null)),
);
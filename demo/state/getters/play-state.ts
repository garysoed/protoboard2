import {source} from 'grapevine';
import {StateId} from 'gs-tools/export/state';
import {$stateService} from 'mask';
import {Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {SlotSpec} from '../../../src/region/slot';
import {ObjectSpec} from '../../../src/types/object-spec';
import {PiecePayload} from '../types/piece-payload';
import {PlayState} from '../types/play-state';
import {RegionPayload} from '../types/region-payload';

import {$demoState} from './demo-state';


export const $playState = source<Observable<PlayState|undefined>>(
    'playState',
    vine => {
      return $demoState.get(vine).pipe(
          switchMap(demoState => {
            if (!demoState) {
              return of(undefined);
            }

            return $stateService.get(vine).resolve(demoState.$playState);
          }),
      );
    },
);
export const $objectSpecIds = source<Observable<ReadonlyArray<StateId<ObjectSpec<PiecePayload|RegionPayload>>>>>(
    'objectSpecIds',
    vine =>  $playState.get(vine).pipe(
        map(playState => playState?.objectSpecIds ?? []),
    ),
);


export const $supplyId = source<Observable<StateId<SlotSpec<{}>>|null>>(
    'supplyId',
    vine => $playState.get(vine).pipe(map(state => state?.$supply ?? null)),
);
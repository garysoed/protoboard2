import {stream} from 'grapevine';
import {StateId} from 'gs-tools/export/state';
import {$stateService} from 'mask';
import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {ActiveSpec} from '../../core/active';
import {ObjectSpec} from '../../types/object-spec';
import {$$rootState} from '../root-state';


export const $rootState = stream(
    'rootState',
    vine => {
      return combineLatest([
        $$rootState.get(vine),
        $stateService.get(vine),
      ])
          .pipe(
              switchMap(([$rootState, stateService]) => {
                if (!$rootState) {
                  return observableOf(null);
                }

                return stateService.get($rootState);
              }));
    },
);

export const $activeId = stream<StateId<ActiveSpec>|null>(
    'activeState',
    vine => $rootState.get(vine).pipe(map(rootState => rootState?.$activeState ?? null)),
);

// TODO: Rename to $activeSpec
export const $activeState = stream<ActiveSpec|null>(
    'activeState',
    vine => combineLatest([$activeId.get(vine), $getObjectSpec.get(vine)]).pipe(
        switchMap(([activeId, getObjectSpec]) => {
          return activeId ? getObjectSpec(activeId) : observableOf(null);
        }),
    ),
);

type GetObjectSpec = <O extends ObjectSpec<any>>(id: StateId<O>) => Observable<O|null>;
export const $getObjectSpec = stream<GetObjectSpec>(
    'getObjectSpec',
    vine => $stateService.get(vine).pipe(
        map(stateService => {
          return <O extends ObjectSpec<any>>(id: StateId<O>) => stateService.get(id);
        }),
    ),
);

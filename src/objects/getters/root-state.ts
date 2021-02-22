import {source} from 'grapevine';
import {StateId} from 'gs-tools/export/state';
import {$stateService} from 'mask';
import {Observable, of as observableOf} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {ActiveSpec} from '../../core/active';
import {ObjectSpec} from '../../types/object-spec';
import {$$rootState} from '../root-state';


export const $rootState = source(
    'rootState',
    vine => {
      return $$rootState.get(vine)
          .pipe(
              switchMap($rootState => {
                if (!$rootState) {
                  return observableOf(null);
                }

                return $stateService.get(vine).resolve($rootState);
              }));
    },
);

export const $activeId = source<Observable<StateId<ActiveSpec>|null>>(
    'activeState',
    vine => $rootState.get(vine).pipe(map(rootState => rootState?.$activeState ?? null)),
);

// TODO: Rename to $activeSpec
export const $activeState = source<Observable<ActiveSpec|undefined>>(
    'activeState',
    vine => $activeId.get(vine).pipe(
        switchMap(activeId => {
          return activeId ? $getObjectSpec.get(vine)(activeId) : observableOf(undefined);
        }),
    ),
);

type GetObjectSpec = <O extends ObjectSpec<any>>(id: StateId<O>) => Observable<O|undefined>;
export const $getObjectSpec = source<GetObjectSpec>(
    'getObjectSpec',
    vine => <O>(id: StateId<O>) => $stateService.get(vine).resolve(id),
);

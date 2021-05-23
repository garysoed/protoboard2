import {$resolveState, $stateService, source} from 'grapevine';
import {StateId} from 'gs-tools/export/state';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {activeSpec, ActiveSpec} from './active';


export const $$activeSpec = source<BehaviorSubject<StateId<ActiveSpec>>>(
    '$activeSpec',
    vine => {
      const stateService = $stateService.get(vine);
      return new BehaviorSubject<StateId<ActiveSpec>>(
          stateService.modify(x => x.add(
              activeSpec({
                $contentSpecs: x.add([]),
              }),
          )));
    },
);

export const $activeSpec = source<Observable<ActiveSpec|undefined>>(
    'activeSpec',
    vine => $$activeSpec.get(vine).pipe(
        switchMap(activeId => {
          return activeId ? $resolveState.get(vine)(activeId) : of(undefined);
        }),
    ),
);
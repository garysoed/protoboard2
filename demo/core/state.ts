import { Vine } from 'grapevine';
import { combineLatest, Observable } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';

import { ACTIVE_ID, ACTIVE_TYPE } from '../../src/region/active';
import { SUPPLY_ID, SUPPLY_TYPE } from '../../src/region/supply';
import { $stateService, setStates } from '../../src/state/state-service';

import { $generateObjectId } from './generate-object-id';

export const ROOT_LAYOUT_ID = 'pbd.rootLayout';

export const ROOT_LAYOUT_TYPE = 'pbd.rootLayout';

export function addObjectToSupply(
    objectType: string,
    payload: Record<string, unknown>,
    vine: Vine,
): Observable<unknown> {
  const currentState$ = $stateService.get(vine).pipe(
      switchMap(service => service.currentState$),
  );

  return combineLatest([
    currentState$,
    $generateObjectId.get(vine),
  ])
  .pipe(
      take(1),
      tap(([currentState, generateObjectId]) => {
        const id = generateObjectId();
        const supplyState = currentState.get(SUPPLY_ID);
        const supplyIds = supplyState?.payload.objectIds;
        const activeState = currentState.get(ACTIVE_ID);
        const activeIds = activeState?.payload.objectIds;
        if (!(supplyIds instanceof Array) ||
            !supplyState ||
            !activeState ||
            !(activeIds instanceof Array)) {
          throw new Error('supplyIds or activeIds cannot be found');
        }

        setStates(
            [
              ...currentState.values(),
              {...activeState, payload: {objectIds: []}},
              {type: objectType, id, payload},
              {...supplyState, payload: {objectIds: [...supplyIds, id]}},
            ],
            vine,
        );
      }),
  );
}

export function initializeState(vine: Vine): void {
  setStates(
      [
        {id: ACTIVE_ID, type: ACTIVE_TYPE, payload: {objectIds: []}},
        {id: SUPPLY_ID, type: SUPPLY_TYPE, payload: {objectIds: []}},
        {id: ROOT_LAYOUT_ID, type: ROOT_LAYOUT_TYPE, payload: {layoutTag: 'TODO'}},
      ],
      vine,
  );
}

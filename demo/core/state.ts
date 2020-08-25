import { Vine } from 'grapevine';
import { combineLatest, Observable } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';

import { ACTIVE_ID, ACTIVE_TYPE, ActivePayload } from '../../src/region/active';
import { SUPPLY_ID, SUPPLY_TYPE, SupplyPayload } from '../../src/region/supply';
import { $stateService, setStates } from '../../src/state/state-service';

import { $generateObjectId } from './generate-object-id';


export const ROOT_SLOT_PREFIX = 'pbd.root-slot';
export const ROOT_SLOT_TYPE = 'pbd.root-slot';

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
        const supplyIds = (supplyState?.payload as SupplyPayload|undefined)?.contentIds;
        const activeState = currentState.get(ACTIVE_ID);
        const activeIds = (activeState?.payload as ActivePayload|undefined)?.contentIds;
        if (!(supplyIds instanceof Array) ||
            !supplyState ||
            !activeState ||
            !(activeIds instanceof Array)) {
          throw new Error('supplyIds or activeIds cannot be found');
        }

        setStates(
            [
              ...currentState.values(),
              {...activeState, payload: {contentIds: []}},
              {type: objectType, id, payload},
              {...supplyState, payload: {contentIds: [...supplyIds, id]}},
            ],
            vine,
        );
      }),
  );
}

export function initializeState(vine: Vine): void {
  const rootSlots = [];
  for (let i = 0; i < 9; i++) {
    rootSlots.push({
      id: `${ROOT_SLOT_PREFIX}${i}`,
      type: ROOT_SLOT_TYPE,
      payload: {contentIds: []},
    });
  }

  setStates(
      [
        ...rootSlots,
        {id: ACTIVE_ID, type: ACTIVE_TYPE, payload: {contentIds: []}},
        {id: SUPPLY_ID, type: SUPPLY_TYPE, payload: {contentIds: []}},
      ],
      vine,
  );
}

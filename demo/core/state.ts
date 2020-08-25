import { Vine } from 'grapevine';

import { ACTIVE_ID, ACTIVE_TYPE } from '../../src/region/active';
import { SUPPLY_ID, SUPPLY_TYPE } from '../../src/region/supply';
import { setStates } from '../../src/state/state-service';


export const ROOT_SLOT_PREFIX = 'pbd.root-slot';
export const ROOT_SLOT_TYPE = 'pbd.root-slot';

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
      new Set([
        ...rootSlots,
        {id: ACTIVE_ID, type: ACTIVE_TYPE, payload: {contentIds: []}},
        {id: SUPPLY_ID, type: SUPPLY_TYPE, payload: {contentIds: []}},
      ]),
      vine,
  );
}

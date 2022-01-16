import {$stateService, source} from 'grapevine';

import {slotState, SlotState} from '../src-next/region/slot';

export interface DemoState {
  readonly slot1: SlotState;
  readonly slot2: SlotState;
  readonly slot3: SlotState;
  readonly slot4: SlotState;
  readonly slot5: SlotState;
  readonly slot6: SlotState;
}

export const $state$ = source(vine => $stateService.get(vine).addRoot<DemoState>({
  slot1: slotState('slot1'),
  slot2: slotState('slot2'),
  slot3: slotState('slot3'),
  slot4: slotState('slot4'),
  slot5: slotState('slot5'),
  slot6: slotState('slot6'),
})._());
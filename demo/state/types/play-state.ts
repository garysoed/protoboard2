import {StateId} from 'gs-tools/export/state';

import {SlotSpec} from '../../../src/region/slot';


export interface PlayState {
  readonly $supply: StateId<SlotSpec>;
  readonly objectSpecIds: ReadonlyArray<StateId<any>>;
}

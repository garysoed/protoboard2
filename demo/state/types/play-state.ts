import {StateId} from 'gs-tools/export/state';

import {SlotSpec} from '../../../src/region/slot';
import {ObjectSpec} from '../../../src/types/object-spec';


export interface PlayState {
  readonly $supply: StateId<SlotSpec<{}>>;
  readonly objectSpecIds: ReadonlyArray<StateId<ObjectSpec<any>>>;
}

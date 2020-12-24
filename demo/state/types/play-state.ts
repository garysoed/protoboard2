import {StateId} from 'gs-tools/export/state';

import {RootState} from '../../../src/objects/root-state';
import {SlotSpec} from '../../../src/region/slot';


export interface PlayState extends RootState {
  readonly $supply: StateId<SlotSpec<{}>>;
}

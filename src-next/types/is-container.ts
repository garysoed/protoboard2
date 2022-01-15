import {MutableState} from 'gs-tools/export/state';

export interface IsContainer {
  readonly contentIds: MutableState<ReadonlyArray<{}>>;
}
import {StateId} from 'gs-tools/export/state';


export interface IsContainer {
  readonly contentsId: StateId<ReadonlyArray<StateId<unknown>>>;
}

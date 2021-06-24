import {StateId} from 'gs-tools/export/state';


export interface IsContainer {
  readonly $contentSpecs: StateId<ReadonlyArray<StateId<unknown>>>;
}


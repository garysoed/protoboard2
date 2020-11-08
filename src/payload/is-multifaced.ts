import {StateId} from 'gs-tools/export/state';

export interface IsMultifaced {
  readonly $currentFaceIndex: StateId<number>;
}

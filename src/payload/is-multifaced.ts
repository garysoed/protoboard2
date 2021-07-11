import {MutableState} from 'gs-tools/export/state';

export interface IsMultifaced {
  readonly currentFaceIndex: MutableState<number>;
}

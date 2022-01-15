import {MutableState} from 'gs-tools/export/state';

export interface IsRotatable {
  readonly rotationDeg: MutableState<number>;
}

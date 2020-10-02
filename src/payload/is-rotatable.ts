import { StateId } from 'gs-tools/export/state';

export interface IsRotatable {
  readonly $rotationDeg: StateId<number>;
}

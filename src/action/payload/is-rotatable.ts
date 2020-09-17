import { StateId } from 'gs-tools/export/state';
import { State } from 'gs-tools/src/random/seed/alea-seed';

export interface IsRotatable {
  readonly $rotationDeg: StateId<number>;
}

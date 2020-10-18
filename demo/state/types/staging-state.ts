import { StateId } from 'gs-tools/export/state';

import { PieceSpec } from './piece-spec';


export interface StagingState {
  readonly $pieceSpecs: StateId<readonly PieceSpec[]>;
}

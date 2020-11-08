import {StateId} from 'gs-tools/export/state';

import {PieceSpec} from './piece-spec';
import {RegionSpec} from './region-spec';


export interface StagingState {
  readonly $pieceSpecs: StateId<readonly PieceSpec[]>;
  readonly $regionSpecs: StateId<readonly RegionSpec[]>;
}

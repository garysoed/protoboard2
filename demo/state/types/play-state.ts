import {ObjectSpec} from '../../../src/objects/object-spec';
import {RootState} from '../../../src/objects/root-state';

import {PiecePayload} from './piece-payload';
import {RegionPayload} from './region-payload';


export interface PlayState extends RootState {
  readonly objectSpecs: ReadonlyArray<ObjectSpec<PiecePayload|RegionPayload>>;
}

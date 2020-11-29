import {StateId} from 'gs-tools/export/state';

import {RootState} from '../../../src/objects/root-state';
import {ObjectSpec} from '../../../src/types/object-spec';

import {PiecePayload} from './piece-payload';
import {RegionPayload} from './region-payload';


export interface PlayState extends RootState {
  readonly objectSpecIds: ReadonlyArray<StateId<ObjectSpec<PiecePayload|RegionPayload>>>;
}

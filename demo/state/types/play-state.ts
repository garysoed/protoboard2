import {StateId} from 'gs-tools/export/state';

import {ObjectSpec} from '../../../src/objects/object-spec';
import {RootState} from '../../../src/objects/root-state';

import {PiecePayload} from './piece-payload';
import {RegionPayload} from './region-payload';


export interface PlayState extends RootState {
  readonly objectSpecIds: ReadonlyArray<StateId<ObjectSpec<PiecePayload|RegionPayload>>>;
}

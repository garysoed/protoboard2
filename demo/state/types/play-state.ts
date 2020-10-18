import { ObjectSpec } from '../../../src/objects/object-spec';
import { HasObjectSpecList } from '../../../src/objects/object-spec-list';

import { PiecePayload } from './piece-payload';
import { RegionPayload } from './region-payload';


export interface PlayState extends HasObjectSpecList {
  readonly objectSpecs: ReadonlyArray<ObjectSpec<PiecePayload|RegionPayload>>;
}

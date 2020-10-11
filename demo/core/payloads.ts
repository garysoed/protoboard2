import { IsContainer } from '../../src/payload/is-container';
import { IsMultifaced } from '../../src/payload/is-multifaced';
import { IsRotatable } from '../../src/payload/is-rotatable';

import { PieceSpec } from './piece-spec';

export interface GenericPiecePayload extends PieceSpec, IsMultifaced, IsRotatable {
}

export interface GenericRegionPayload extends IsContainer<any> {
  readonly index: number;
}

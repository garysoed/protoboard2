import {HasParent} from '../../../src/payload/has-parent';
import {IsMultifaced} from '../../../src/payload/is-multifaced';
import {IsRotatable} from '../../../src/payload/is-rotatable';

import {PieceSpec} from './piece-spec';

export interface PiecePayload extends PieceSpec, IsRotatable, IsMultifaced, HasParent {
  readonly type: 'piece';
}

import {ObjectClass, ObjectSpec} from './object-spec';

export interface PieceSpec<P> extends ObjectSpec<P> {
  readonly objectClass: ObjectClass.PIECE;
}

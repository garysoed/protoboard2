import {ObjectClass, ObjectSpec} from './object-spec';

export interface PieceSpec<P> extends ObjectSpec<P> {
  readonly objectClass: ObjectClass.PIECE;
}

interface Input<P> {
  readonly type: string;
  readonly payload: P;
}

export function pieceSpec<P>(input: Input<P>): PieceSpec<P> {
  return {
    ...input,
    objectClass: ObjectClass.PIECE,
  };
}
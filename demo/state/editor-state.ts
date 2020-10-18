import { PieceState } from './types/piece-state';

export enum PieceTypes {
  D1 = 'd1',
  D2 = 'd2',
  D6 = 'd6',
}

export interface EditorState {
  readonly [PieceTypes.D1]: PieceState<1>;
  readonly [PieceTypes.D2]: PieceState<2>;
  readonly [PieceTypes.D6]: PieceState<6>;
}

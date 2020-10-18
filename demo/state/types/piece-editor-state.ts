import { PieceState } from './piece-state';
import { PieceType } from './piece-type';

export interface PieceEditorState {
  readonly [PieceType.D1]: PieceState<1>;
  readonly [PieceType.D2]: PieceState<2>;
  readonly [PieceType.D6]: PieceState<6>;
}

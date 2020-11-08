import {StateId} from 'gs-tools/export/state';

export const FACE_ICONS = ['meeple', 'coin', 'gem', 'card'];

export interface PieceState<L extends number> {
  readonly length: L;
  readonly $editedFace: StateId<number>;
  readonly $faceIcons: StateId<readonly string[]>;
}

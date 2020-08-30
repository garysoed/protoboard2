export const ADD_PIECE_EVENT = 'pbd-add-piece';

export class AddPieceEvent extends Event {
  constructor(readonly faceIcons: readonly string[]) {
    super(ADD_PIECE_EVENT, {bubbles: true});
  }
}

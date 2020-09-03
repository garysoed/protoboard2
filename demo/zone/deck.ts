import { _p, ThemedCustomElementCtrl } from 'mask';

import { Deck } from '../../src/zone/deck';
import { PieceTemplate } from '../template/piece-template';

import template from './deck.html';

export const $deckDemo = {
  tag: 'pbd-deck',
  api: {},
};

@_p.customElement({
  ...$deckDemo,
  template,
  dependencies: [
    Deck,
    PieceTemplate,
  ],
})
export class DeckDemo extends ThemedCustomElementCtrl {

}

import {_p, ThemedCustomElementCtrl} from 'mask';

import {Deck} from '../../src/region/deck';
import {RegionTemplate} from '../template/region-template';

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
    RegionTemplate,
  ],
})
export class DeckDemo extends ThemedCustomElementCtrl {

}

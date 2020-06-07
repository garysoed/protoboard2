import { _p, ThemedCustomElementCtrl } from 'mask';

import { Deck as DeckImpl } from '../../src/zone/deck';
import { ZoneTemplate } from '../template/zone-template';

import template from './deck.html';

@_p.customElement({
  tag: 'pbd-deck',
  template,
  dependencies: [
    DeckImpl,
    ZoneTemplate,
  ],
  api: {},
})
export class Deck extends ThemedCustomElementCtrl {

}

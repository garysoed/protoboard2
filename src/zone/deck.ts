import { Vine } from 'grapevine';
import { _p } from 'mask';

import { BaseComponent } from '../core/base-component';

import template from './deck.html';


@_p.customElement({
  tag: 'pb-deck',
  template,
})
export class Deck extends BaseComponent {
  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(
        [],
        shadowRoot,
        vine,
    );
  }
}

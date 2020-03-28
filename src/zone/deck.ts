import { Vine } from 'grapevine';
import { _p } from 'mask';
import { element } from 'persona';

import { DropAction } from '../action/drop-action';
import { ShuffleAction } from '../action/shuffle-action';
import { BaseComponent } from '../core/base-component';

import template from './deck.html';


const $ = {
  host: element({}),
};

@_p.customElement({
  tag: 'pb-deck',
  template,
})
export class Deck extends BaseComponent {
  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(
        [
          new DropAction($.host.getValue(shadowRoot)),
          new ShuffleAction(),
        ],
        shadowRoot,
        vine,
    );
  }
}

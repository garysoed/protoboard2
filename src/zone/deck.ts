import { _p } from 'mask';
import { element, PersonaContext } from 'persona';

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
  constructor(context: PersonaContext) {
    super(
        [
          new DropAction($.host.getValue(context.shadowRoot)),
          new ShuffleAction(),
        ],
        context,
    );
  }
}

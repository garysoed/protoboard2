import { Vine } from 'grapevine';
import { _p } from 'mask';
import { element } from 'persona';

import { DropAction } from '../action/drop-action';
import { BaseComponent } from '../core/base-component';

import template from './slot.html';

const $ = {
  host: element({}),
};

@_p.customElement({
  tag: 'pb-slot',
  template,
})
export class Slot extends BaseComponent {
  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(
        [new DropAction($.host.getValue(shadowRoot))],
        shadowRoot,
        vine,
    );
  }
}

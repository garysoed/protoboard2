import { _p } from '@mask';

import { PickAction } from '../action/pick-action';
import { BaseComponent } from '../core/base-component';

import template from './d1.html';

@_p.customElement({
  tag: 'pb-d1',
  template,
})
export class D1 extends BaseComponent {
  constructor(shadowRoot: ShadowRoot) {
    super(
        [
          new PickAction(),
        ],
        shadowRoot,
    );
  }
}

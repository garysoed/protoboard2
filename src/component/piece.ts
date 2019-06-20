import { _p } from '@mask';
import { PickAction } from '../action/pick-action';
import { BaseComponent } from '../core/base-component';
import template from './piece.html';

@_p.customElement({
  tag: 'pb-piece',
  template,
})
export class Piece extends BaseComponent {
  constructor(shadowRoot: ShadowRoot) {
    super(
        [
          new PickAction(),
        ],
        shadowRoot,
    );
  }
}

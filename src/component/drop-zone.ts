import { _p } from '@mask';
import { element } from '@persona';
import { DropAction } from '../action/drop-action';
import { BaseComponent } from '../core/base-component';
import template from './drop-zone.html';

const $ = {
  host: element({}),
};

@_p.customElement({
  tag: 'pb-drop-zone',
  template,
})
export class DropZone extends BaseComponent {
  constructor(shadowRoot: ShadowRoot) {
    super(
        [new DropAction($.host.getValue(shadowRoot))],
        shadowRoot,
    );
  }
}

import { _p } from 'mask';
import { element, PersonaContext } from 'persona';

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
  constructor(context: PersonaContext) {
    super(
        [new DropAction($.host.getValue(context.shadowRoot))],
        context,
    );
  }
}

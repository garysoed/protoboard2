import { instanceofType } from 'gs-types';
import { _p, ThemedCustomElementCtrl } from 'mask';
import { attributeIn, attributeOut, element, PersonaContext, stringParser } from 'persona';

import template from './face.html';


const $$ = {
  display: attributeIn('display', stringParser()),
};

const $ = {
  host: element($$),
  slot: element('slot', instanceofType(HTMLSlotElement), {
    name: attributeOut('name', stringParser()),
  }),
};

/**
 * A face allows you to control what to display.
 *
 * A face can have several display elements. To add a display element, add an element as a child of
 * pb-face. Each of the children must have a slot attribute with a name. This element will display
 * the display element iff the value of attribute display matches the slot name.
 */
@_p.customElement({
  tag: 'pb-face',
  template,
})
export class Face extends ThemedCustomElementCtrl {
  private readonly display$ = this.declareInput($.host._.display);

  constructor(context: PersonaContext) {
    super(context);

    this.render($.slot._.name).withObservable(this.display$);
  }
}

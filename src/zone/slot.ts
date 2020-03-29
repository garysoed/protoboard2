import { _p } from 'mask';
import { element, PersonaContext } from 'persona';

import { DropAction } from '../action/drop-action';
import { BaseAction } from '../core/base-action';
import { BaseComponent } from '../core/base-component';
import { TriggerSpec, UnreservedTriggerSpec } from '../core/trigger-spec';

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
        new Map<UnreservedTriggerSpec, BaseAction>([
          [TriggerSpec.D, new DropAction($.host.getValue(context.shadowRoot), context.vine)],
        ]),
        context,
    );
  }
}

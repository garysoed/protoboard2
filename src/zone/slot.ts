import { _p } from 'mask';
import { host, PersonaContext } from 'persona';

import { DropAction } from '../action/drop-action';
import { BaseAction } from '../core/base-action';
import { BaseComponent } from '../core/base-component';
import { TriggerSpec, UnreservedTriggerSpec } from '../core/trigger-spec';

import template from './slot.html';


const $$ = {
  tag: 'pb-slot',
  api: {},
};

const $ = {
  host: host($$.api),
};

@_p.customElement({
  ...$$,
  template,
})
export class Slot extends BaseComponent {
  constructor(context: PersonaContext) {
    super(
        new Map<UnreservedTriggerSpec, BaseAction>([
          [TriggerSpec.D, new DropAction($.host.getValue(context), context.vine)],
        ]),
        context,
    );
  }
}

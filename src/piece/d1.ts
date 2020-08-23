import { _p } from 'mask';
import { PersonaContext, renderCustomElement } from 'persona';
import { Observable } from 'rxjs';

import { BaseAction } from '../core/base-action';
import { BaseComponent } from '../core/base-component';
import { TriggerSpec, UnreservedTriggerSpec } from '../core/trigger-spec';
import { State } from '../state/state';

import template from './d1.html';

// import { PickAction } from '../action/pick-action';
// import { RotateAction } from '../action/rotate-action';

export const $d1 = {
  tag: 'pb-d1',
  api: {},
};

@_p.customElement({
  tag: 'pb-d1',
  template,
  api: {},
})
export class D1 extends BaseComponent {
  constructor(context: PersonaContext) {
    super(
        new Map<UnreservedTriggerSpec, BaseAction>([
          // [TriggerSpec.CLICK, new PickAction(context.vine)],
          // [TriggerSpec.R, new RotateAction(0, [0, 90, 180, 270], context.vine)],
        ]),
        context,
    );
  }
}

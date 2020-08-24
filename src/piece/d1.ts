import { _p } from 'mask';
import { PersonaContext } from 'persona';

import { PickAction } from '../action/pick-action';
import { $baseActionApi, BaseAction } from '../core/base-action';
import { BaseComponent } from '../core/base-component';
import { TriggerSpec, UnreservedTriggerSpec } from '../core/trigger-spec';

import template from './d1.html';


// import { RotateAction } from '../action/rotate-action';

export const $d1 = {
  tag: 'pb-d1',
  api: {...$baseActionApi},
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
          [TriggerSpec.CLICK, new PickAction(context)],
          // [TriggerSpec.R, new RotateAction(0, [0, 90, 180, 270], context.vine)],
        ]),
        context,
    );
  }
}

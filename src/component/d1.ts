import { _p } from 'mask';
import { PersonaContext } from 'persona';

import { PickAction } from '../action/pick-action';
import { RotateAction } from '../action/rotate-action';
import { BaseComponent } from '../core/base-component';

import template from './d1.html';
import { UnreservedTriggerSpec, TriggerSpec } from '../core/trigger-spec';
import { BaseAction } from '../core/base-action';


@_p.customElement({
  tag: 'pb-d1',
  template,
})
export class D1 extends BaseComponent {
  constructor(context: PersonaContext) {
    super(
        new Map<UnreservedTriggerSpec, BaseAction>([
          [TriggerSpec.P, new PickAction(context.vine)],
          [TriggerSpec.R, new RotateAction(0, [0, 90, 180, 270], context.vine)],
        ]),
        context,
    );
  }
}

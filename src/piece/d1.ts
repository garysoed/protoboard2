import { _p } from 'mask';
import { PersonaContext } from 'persona';

import { PickAction } from '../action/pick-action';
import { $baseActionApi, BaseAction } from '../core/base-action';
import { BaseComponent } from '../core/base-component';
import { TriggerSpec, UnreservedTriggerSpec } from '../core/trigger-spec';

import template from './d1.html';


// import { RotateAction } from '../action/rotate-action';

/**
 * The D1's API.
 *
 * @thModule piece
 */
export const $d1 = {
  tag: 'pb-d1',
  api: {...$baseActionApi},
};

/**
 * Represents an object with one face.
 *
 * @remarks
 * D1 supports {@link PickAction} and {@link RotateAction}.
 *
 * @thSlot - Face to display for the object.
 * @thWebComponent
 * @thModule piece
 */
@_p.customElement({
  tag: 'pb-d1',
  template,
  api: {},
})
export class D1 extends BaseComponent {
  /**
   * @internal
   */
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

import { _p } from 'mask';
import { PersonaContext } from 'persona';

import { MovablePayload } from '../action/payload/movable-payload';
import { RotatablePayload } from '../action/payload/rotatable-payload';
import { PickAction } from '../action/pick-action';
import { RotateAction } from '../action/rotate-action';
import { $baseComponent, BaseActionCtor, BaseComponent } from '../core/base-component';
import { TriggerSpec, UnreservedTriggerSpec } from '../core/trigger-spec';

import template from './d1.html';


/**
 * The D1's API.
 *
 * @thModule piece
 */
export const $d1 = {
  tag: 'pb-d1',
  api: {...$baseComponent.api},
};

export interface D1Payload extends MovablePayload, RotatablePayload { }

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
export class D1 extends BaseComponent<D1Payload> {
  /**
   * @internal
   */
  constructor(context: PersonaContext) {
    super(
        new Map<UnreservedTriggerSpec, BaseActionCtor<D1Payload, any>>([
          [TriggerSpec.CLICK, context => new PickAction(context)],
          [
            TriggerSpec.R,
            context => new RotateAction(context, {index: 0, stops: [0, 90, 180, 270]}),
          ],
        ]),
        context,
    );
  }
}

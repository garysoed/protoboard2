import { _p } from 'mask';
import { host, PersonaContext, slotted, style } from 'persona';

import { IsRotatable } from '../action/payload/is-rotatable';
import { RotateAction } from '../action/rotate-action';
import { $baseComponent, BaseActionCtor, BaseComponent } from '../core/base-component';
import { TriggerSpec, UnreservedTriggerSpec } from '../core/trigger-spec';
import { renderRotatable } from '../render/render-rotatable';

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

export type D1Payload = IsRotatable;

const $ = {
  slot: slotted('slot', {
    styleTransform: style('transform'),
  }),
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
export class D1 extends BaseComponent<D1Payload> {
  /**
   * @internal
   */
  constructor(context: PersonaContext) {
    super(
        new Map<UnreservedTriggerSpec, BaseActionCtor<D1Payload, any>>([
          [
            TriggerSpec.R,
            context => new RotateAction(context, {stops: [0, 90, 180, 270]}),
          ],
        ]),
        context,
        host({}),
    );

    this.addSetup(renderRotatable(this.objectPayload$, $.slot._.styleTransform, context));
  }
}

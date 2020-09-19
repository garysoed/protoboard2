import { instanceofType } from 'gs-types';
import { _p } from 'mask';
import { attributeOut, element, host, PersonaContext, slotted, stringParser, style } from 'persona';

import { FlipAction } from '../action/flip-action';
import { IsMultifaced } from '../action/payload/is-multifaced';
import { IsRotatable } from '../action/payload/is-rotatable';
import { RollAction } from '../action/roll-action';
import { RotateAction } from '../action/rotate-action';
import { TurnAction } from '../action/turn-action';
import { $baseComponent, BaseActionCtor, BaseComponent } from '../core/base-component';
import { TriggerSpec, UnreservedTriggerSpec } from '../core/trigger-spec';
import { renderMultifaced } from '../render/render-multifaced';
import { renderRotatable } from '../render/render-rotatable';

import template from './d2.html';


/**
 * The D2's API.
 *
 * @thModule piece
 */
export const $d2 = {
  api: {...$baseComponent.api},
  tag: 'pb-d2',
};

export const $ = {
  host: host($d2.api),
  face: element('face', instanceofType(HTMLSlotElement), {
    name: attributeOut('name', stringParser()),
  }),
  slot: slotted('face', {
    styleTransform: style('transform'),
  }),
};

export interface D2Payload extends IsMultifaced, IsRotatable {

}

/**
 * Represents an object with two faces.
 *
 * @remarks
 * D2 supports {@link PickAction}, {@link RotateAction}., {@link FlipAction}, {@link RollAction},
 * and {@link TurnAction}.
 *
 * @thSlot - Face to display for the object.
 * @thWebComponent
 * @thModule piece
 */
@_p.customElement({
  ...$d2,
  template,
})
export class D2 extends BaseComponent<D2Payload> {
  constructor(context: PersonaContext) {
    super(
        new Map<UnreservedTriggerSpec, BaseActionCtor<D2Payload, any>>([
          [
            TriggerSpec.R,
            context => new RotateAction(context, {stops: [0, 90, 180, 270]}),
          ],
          [TriggerSpec.F, context => new FlipAction(context, {count: 2})],
          [TriggerSpec.T, context => new TurnAction(context, {count: 2})],
          [TriggerSpec.L, context => new RollAction(context, {count: 2})],
        ]),
        context,
        $.host,
    );
    this.addSetup(renderMultifaced(this.objectPayload$, $.face._.name, context));
    this.addSetup(renderRotatable(this.objectPayload$, $.slot._.styleTransform, context));
  }
}

import { instanceofType } from 'gs-types';
import { _p } from 'mask';
import { api, attributeOut, element, host, PersonaContext, slotted, stringParser, style } from 'persona';

import { FlipAction } from '../action/flip-action';
import { IsMultifaced } from '../action/payload/is-multifaced';
import { IsRotatable } from '../action/payload/is-rotatable';
import { RollAction } from '../action/roll-action';
import { RotateAction } from '../action/rotate-action';
import { TurnAction } from '../action/turn-action';
import { BaseAction } from '../core/base-action';
import { $baseComponent, BaseActionCtor, BaseComponent } from '../core/base-component';
import { TriggerSpec, UnreservedTriggerSpec } from '../core/trigger-spec';
import { renderMultifaced } from '../render/render-multifaced';
import { renderRotatable } from '../render/render-rotatable';

import template from './d6.html';


/**
 * The D6's API.
 *
 * @thModule piece
 */
export const $d6 = {
  api: {...$baseComponent.api},
  tag: 'pb-d6',
};

export const $ = {
  host: host($d6.api),
  face: element('face', instanceofType(HTMLSlotElement), {
    name: attributeOut('name', stringParser()),
  }),
  slot: slotted('face', {
    styleTransform: style('transform'),
  }),
};

export interface D6Payload extends IsMultifaced, IsRotatable {

}

/**
 * Represents an object with six faces.
 *
 * @remarks
 * D6 supports {@link PickAction}, {@link RotateAction}., {@link FlipAction}, {@link RollAction},
 * and {@link TurnAction}.
 *
 * @thSlot - Face to display for the object.
 * @thWebComponent
 * @thModule piece
 */
@_p.customElement({
  ...$d6,
  template,
})
export class D6 extends BaseComponent<D6Payload> {
  constructor(context: PersonaContext) {
    super(
        [
          {
            trigger: TriggerSpec.R as const,
            provider: context => new RotateAction(context, {stops: [0, 90, 180, 270]}),
          },
          {
            trigger: TriggerSpec.F as const,
            provider: context => new FlipAction(context, {count: 6}),
          },
          {
            trigger: TriggerSpec.T as const,
            provider: context => new TurnAction(context, {count: 6}),
          },
          {
            trigger: TriggerSpec.L as const,
            provider: context => new RollAction(context, {count: 6}),
          },
        ],
        context,
        $.host,
    );
    this.addSetup(renderMultifaced(this.objectPayload$, $.face._.name, context));
    this.addSetup(renderRotatable(this.objectPayload$, $.slot._.styleTransform, context));
  }
}

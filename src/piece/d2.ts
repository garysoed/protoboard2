import { instanceofType } from 'gs-types';
import { _p } from 'mask';
import { attributeOut, element, host, PersonaContext, slotted, stringParser, style } from 'persona';

import { FlipAction } from '../action/flip-action';
import { RollAction } from '../action/roll-action';
import { RotateAction } from '../action/rotate-action';
import { TurnAction } from '../action/turn-action';
import { $baseComponent, BaseComponent } from '../core/base-component';
import { TriggerType } from '../core/trigger-spec';
import { IsMultifaced } from '../payload/is-multifaced';
import { IsRotatable } from '../payload/is-rotatable';
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
  slot: element('face', instanceofType(HTMLSlotElement), {
    slotted: slotted(),
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
        [
          {
            trigger: TriggerType.R,
            provider: context => new RotateAction(context, {stops: [0, 90, 180, 270]}),
          },
          {
            trigger: TriggerType.F,
            provider: context => new FlipAction(context, {count: 2}),
          },
          {
            trigger: TriggerType.T,
            provider: context => new TurnAction(context, {count: 2}),
          },
          {
            trigger: TriggerType.L,
            provider: context => new RollAction(context, {count: 2}),
          },
        ],
        context,
    );
    this.addSetup(renderMultifaced(this.objectPayload$, $.face._.name, context));
    this.addSetup(
        renderRotatable(this.objectPayload$, this.declareInput($.slot._.slotted), context),
    );
  }
}

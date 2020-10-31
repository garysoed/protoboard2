import { instanceofType } from 'gs-types';
import { _p } from 'mask';
import { element, PersonaContext, slotted } from 'persona';

import { PickAction } from '../action/pick-action';
import { RotateAction } from '../action/rotate-action';
import { $baseComponent, BaseComponent } from '../core/base-component';
import { TriggerType } from '../core/trigger-spec';
import { HasParent } from '../payload/has-parent';
import { IsRotatable } from '../payload/is-rotatable';
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

export type D1Payload = IsRotatable & HasParent;

const $ = {
  slot: element('slot', instanceofType(HTMLSlotElement), {
    slotted: slotted(),
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
        [
          {
            trigger: {type: TriggerType.R},
            provider: context => new RotateAction(context, {stops: [0, 90, 180, 270]}),
          },
          {trigger: TriggerType.CLICK, provider: context => new PickAction(() => 0, context, {})},
        ],
        context,
    );

    this.addSetup(
        renderRotatable(this.objectPayload$, this.declareInput($.slot._.slotted), context),
    );
  }
}

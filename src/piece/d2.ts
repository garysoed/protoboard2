import {cache} from 'gs-tools/export/data';
import {_p} from 'mask';
import {$slot, attributeOut, element, host, PersonaContext, slotted, stringParser} from 'persona';
import {Observable} from 'rxjs';

import {flipAction} from '../action/flip-action';
import {pickAction} from '../action/pick-action';
import {rollAction} from '../action/roll-action';
import {rotateAction} from '../action/rotate-action';
import {turnAction} from '../action/turn-action';
import {$baseComponent, BaseComponent} from '../core/base-component';
import {TriggerType} from '../core/trigger-spec';
import {IsMultifaced} from '../payload/is-multifaced';
import {IsRotatable} from '../payload/is-rotatable';
import {renderMultifaced} from '../render/render-multifaced';
import {renderRotatable} from '../render/render-rotatable';

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
  face: element('face', $slot, {
    name: attributeOut('name', stringParser()),
  }),
  slot: element('face', $slot, {
    slotted: slotted(),
  }),
};

export type D2Spec = IsMultifaced&IsRotatable;

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
export class D2 extends BaseComponent<D2Spec, typeof $> {
  constructor(context: PersonaContext) {
    super(
        [
          rotateAction({stops: [0, 90, 180, 270], trigger: TriggerType.R}),
          flipAction({count: 2, trigger: TriggerType.F}),
          turnAction({count: 2, trigger: TriggerType.T}),
          rollAction({count: 2, trigger: TriggerType.L}),
          pickAction({trigger: TriggerType.CLICK}),
        ],
        context,
        $,
    );
    this.addSetup(renderMultifaced(this.objectSpec$, $.face._.name, context));
    this.addSetup(
        renderRotatable(this.objectSpec$, this.inputs.slot.slotted, context),
    );
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [];
  }
}

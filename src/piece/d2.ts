import {cache} from 'gs-tools/export/data';
import {_p} from 'mask';
import {$slot, attributeOut, element, host, PersonaContext, slotted, stringParser} from 'persona';
import {Observable} from 'rxjs';

import {FlipAction} from '../action/flip-action';
import {PickAction} from '../action/pick-action';
import {RollAction} from '../action/roll-action';
import {RotateAction} from '../action/rotate-action';
import {TurnAction} from '../action/turn-action';
import {$baseComponent, BaseComponent} from '../core/base-component';
import {TriggerType} from '../core/trigger-spec';
import {IsMultifaced} from '../payload/is-multifaced';
import {IsRotatable} from '../payload/is-rotatable';
import {renderMultifaced} from '../render/render-multifaced';
import {renderRotatable} from '../render/render-rotatable';
import {PieceSpec} from '../types/piece-spec';

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

export type D2Spec = PieceSpec<IsMultifaced&IsRotatable>;

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
          {
            trigger: TriggerType.R,
            provider: context => new RotateAction(context as any, {stops: [0, 90, 180, 270]}),
          },
          {
            trigger: TriggerType.F,
            provider: context => new FlipAction(context as any, {count: 2}),
          },
          {
            trigger: TriggerType.T,
            provider: context => new TurnAction(context as any, {count: 2}),
          },
          {
            trigger: TriggerType.L,
            provider: context => new RollAction(context as any, {count: 2}),
          },
          {trigger: TriggerType.CLICK, provider: context => new PickAction(context, {})},
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

import {cache} from 'gs-tools/export/data';
import {instanceofType} from 'gs-types';
import {_p} from 'mask';
import {PersonaContext, element, slotted, host} from 'persona';
import {Observable} from 'rxjs';

import {PickAction} from '../action/pick-action';
import {RotateAction} from '../action/rotate-action';
import {$baseComponent, BaseComponent} from '../core/base-component';
import {TriggerType} from '../core/trigger-spec';
import {IsRotatable} from '../payload/is-rotatable';
import {renderRotatable} from '../render/render-rotatable';
import {PieceSpec} from '../types/piece-spec';

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
  host: host($d1.api),
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
export class D1 extends BaseComponent<PieceSpec<D1Payload>, typeof $> {
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
        $,
    );

    this.addSetup(renderRotatable(this.objectSpec$, this.inputs.slot.slotted, context));
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [];
  }
}

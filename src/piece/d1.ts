import {cache} from 'gs-tools/export/data';
import {Modifier} from 'gs-tools/export/state';
import {stateIdParser, _p} from 'mask';
import {$slot, attributeIn, element, host, PersonaContext, slotted} from 'persona';
import {Observable} from 'rxjs';

import {ActionSpec, TriggerConfig} from '../action/action-spec';
import {pickAction, pickActionConfigSpecs} from '../action/pick-action';
import {rotateAction, rotateActionConfigSpecs} from '../action/rotate-action';
import {compileConfig} from '../action/util/compile-config';
import {BaseComponent} from '../core/base-component';
import {IsRotatable} from '../payload/is-rotatable';
import {renderRotatable} from '../render/render-rotatable';

import template from './d1.html';


/**
 * The D1's API.
 *
 * @thModule piece
 */
export const $d1 = {
  tag: 'pb-d1',
  api: {
    objectId: attributeIn('object-id', stateIdParser<D1Spec>()),
    pickAction: pickActionConfigSpecs({}),
    rotateAction: rotateActionConfigSpecs({}),
  },
};

export type D1Spec = IsRotatable;

export function d1Spec(partial: Partial<D1Spec>, x: Modifier): D1Spec {
  return {
    $rotationDeg: partial.$rotationDeg ?? x.add(0),
  };
}

const $ = {
  host: host($d1.api),
  slot: element('slot', $slot, {
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
export class D1 extends BaseComponent<D1Spec, typeof $> {
  /**
   * @internal
   */
  constructor(context: PersonaContext) {
    super(context, $);

    this.addSetup(renderRotatable(this.objectSpec$, this.inputs.slot.slotted, context));
  }

  @cache()
  protected get actions(): ReadonlyArray<ActionSpec<D1Spec, TriggerConfig>> {
    return [
      rotateAction(compileConfig($.host._.rotateAction, this.context), this.context),
      pickAction(compileConfig($.host._.pickAction, this.context), this.context),
    ];
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [];
  }
}

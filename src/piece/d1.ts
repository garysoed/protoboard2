import {cache} from 'gs-tools/export/data';
import {mutableState} from 'gs-tools/export/state';
import {objectPathParser, _p} from 'mask';
import {$slot, attributeIn, element, host, PersonaContext, slotted} from 'persona';
import {Observable} from 'rxjs';

import {ActionSpec} from '../action/action-spec';
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
    objectPath: attributeIn('object-path', objectPathParser<D1Spec>()),
    pickAction: pickActionConfigSpecs({}),
    rotateAction: rotateActionConfigSpecs({}),
  },
};

export type D1Spec = IsRotatable;

export function d1Spec(partial: Partial<D1Spec>): D1Spec {
  return {
    rotationDeg: mutableState(0),
    ...partial,
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
    super(context, $, $.host._.objectPath);

    this.addSetup(renderRotatable(this.objectSpec$, this.inputs.slot.slotted, context));
  }

  @cache()
  protected get actions(): readonly ActionSpec[] {
    return [
      this.createActionSpec(
          rotateAction,
          compileConfig($.host._.rotateAction, this.context),
          'Rotate',
      ),
      this.createActionSpec(
          pickAction,
          compileConfig($.host._.pickAction, this.context),
          'Pick',
      ),
    ];
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [];
  }
}

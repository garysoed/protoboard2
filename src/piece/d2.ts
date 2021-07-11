import {cache} from 'gs-tools/export/data';
import {mutableState} from 'gs-tools/export/state';
import {objectPathParser, _p} from 'mask';
import {$slot, attributeIn, attributeOut, element, host, PersonaContext, slotted, stringParser} from 'persona';
import {Observable} from 'rxjs';

import {ActionSpec} from '../action/action-spec';
import {flipAction, flipActionConfigSpecs} from '../action/flip-action';
import {pickAction, pickActionConfigSpecs} from '../action/pick-action';
import {rollAction, rollActionConfigSpecs} from '../action/roll-action';
import {rotateAction, rotateActionConfigSpecs} from '../action/rotate-action';
import {turnAction, turnActionConfigSpecs} from '../action/turn-action';
import {compileConfig} from '../action/util/compile-config';
import {BaseComponent} from '../core/base-component';
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
  api: {
    objectPath: attributeIn('object-path', objectPathParser<D2Spec>()),
    rotateAction: rotateActionConfigSpecs({}),
    flipAction: flipActionConfigSpecs({count: 2}),
    turnAction: turnActionConfigSpecs({count: 2}),
    rollAction: rollActionConfigSpecs({count: 2}),
    pickAction: pickActionConfigSpecs({}),
  },
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

export function d2Spec(partial: Partial<D2Spec>): D2Spec {
  return {
    currentFaceIndex: mutableState(0),
    rotationDeg: mutableState(0),
    ...partial,
  };
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
export class D2 extends BaseComponent<D2Spec, typeof $> {
  constructor(context: PersonaContext) {
    super(context, $, $.host._.objectPath);
    this.addSetup(renderMultifaced(this.objectSpec$, $.face._.name, context));
    this.addSetup(
        renderRotatable(this.objectSpec$, this.inputs.slot.slotted, context),
    );
  }

  @cache()
  protected get actions(): readonly ActionSpec[] {
    return [
      this.createActionSpec(rotateAction, compileConfig($.host._.rotateAction, this.context), 'Rotate'),
      this.createActionSpec(flipAction, compileConfig($.host._.flipAction, this.context), 'Flip'),
      this.createActionSpec(turnAction, compileConfig($.host._.turnAction, this.context), 'Turn'),
      this.createActionSpec(rollAction, compileConfig($.host._.rollAction, this.context), 'Roll'),
      this.createActionSpec(pickAction, compileConfig($.host._.pickAction, this.context), 'Pick'),
    ];
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [];
  }
}

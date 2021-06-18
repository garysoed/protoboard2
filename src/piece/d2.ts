import {cache} from 'gs-tools/export/data';
import {Modifier} from 'gs-tools/export/state';
import {stateIdParser, _p} from 'mask';
import {$slot, attributeIn, attributeOut, element, host, PersonaContext, slotted, stringParser} from 'persona';
import {Observable} from 'rxjs';

import {ActionSpec, TriggerConfig} from '../action/action-spec';
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
    objectId: attributeIn('object-id', stateIdParser<D2Spec>()),
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

export function d2Spec(partial: Partial<D2Spec>, x: Modifier): D2Spec {
  return {
    $currentFaceIndex: partial.$currentFaceIndex ?? x.add(0),
    $rotationDeg: partial.$rotationDeg ?? x.add(0),
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
    super(context, $);
    this.addSetup(renderMultifaced(this.objectSpec$, $.face._.name, context));
    this.addSetup(
        renderRotatable(this.objectSpec$, this.inputs.slot.slotted, context),
    );
  }

  @cache()
  protected get actions(): ReadonlyArray<ActionSpec<D2Spec, TriggerConfig>> {
    return [
      rotateAction(compileConfig($.host._.rotateAction, this.context), this.objectId$, this.context),
      flipAction(compileConfig($.host._.flipAction, this.context), this.objectId$, this.context),
      turnAction(compileConfig($.host._.turnAction, this.context), this.objectId$, this.context),
      rollAction(compileConfig($.host._.rollAction, this.context), this.objectId$, this.context),
      pickAction(compileConfig($.host._.pickAction, this.context), this.objectId$, this.context),
    ];
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [];
  }
}

import {cache} from 'gs-tools/export/data';
import {StateId} from 'gs-tools/export/state';
import {_p} from 'mask';
import {$slot, attributeOut, element, host, PersonaContext, slotted, stringParser, style} from 'persona';
import {Observable} from 'rxjs';

import {flipAction, flipActionConfigSpecs} from '../action/flip-action';
import {pickAction, pickActionConfigSpecs} from '../action/pick-action';
import {rollAction, rollActionConfigSpecs} from '../action/roll-action';
import {rotateAction, rotateActionConfigSpecs} from '../action/rotate-action';
import {turnAction, turnActionConfigSpecs} from '../action/turn-action';
import {$baseComponent, BaseComponent} from '../core/base-component';
import {IsMultifaced} from '../payload/is-multifaced';
import {IsRotatable} from '../payload/is-rotatable';
import {renderMultifaced} from '../render/render-multifaced';
import {renderRotatable} from '../render/render-rotatable';

import template from './d6.html';


/**
 * The D6's API.
 *
 * @thModule piece
 */
export const $d6 = {
  api: {
    ...$baseComponent.api,
    rotateAction: rotateActionConfigSpecs({}),
    flipAction: flipActionConfigSpecs({count: 6}),
    turnAction: turnActionConfigSpecs({count: 6}),
    rollAction: rollActionConfigSpecs({count: 6}),
    pickAction: pickActionConfigSpecs({}),
  },
  tag: 'pb-d6',
};

export const $ = {
  host: host($d6.api),
  face: element('face', $slot, {
    name: attributeOut('name', stringParser()),
    slotted: slotted(),
  }),
  styleTransform: style('transform'),
};

export type D6Spec = IsMultifaced&IsRotatable;

interface Input {
  readonly type: string;
  readonly $currentFaceIndex: StateId<number>;
  readonly $rotationDeg: StateId<number>;
}

export function d6Spec(input: Input): D6Spec {
  return {
    $currentFaceIndex: input.$currentFaceIndex,
    $rotationDeg: input.$rotationDeg,
  };
}

/**
 * Represents an object with six faces.
 *
 * @remarks
 * @thWebComponent
 * @thModule piece
 */
@_p.customElement({
  ...$d6,
  template,
})
export class D6 extends BaseComponent<D6Spec, typeof $> {
  constructor(context: PersonaContext) {
    super(
        [
          rotateAction($.host._.rotateAction),
          flipAction($.host._.flipAction),
          turnAction($.host._.turnAction),
          rollAction($.host._.rollAction),
          pickAction($.host._.pickAction),
        ],
        context,
        $,
    );
    this.addSetup(renderMultifaced(this.objectSpec$, $.face._.name, context));
    this.addSetup(renderRotatable(this.objectSpec$, this.inputs.face.slotted, context));
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [];
  }
}

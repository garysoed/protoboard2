import {cache} from 'gs-tools/export/data';
import {mutableState} from 'gs-tools/export/state';
import {objectPathParser, _p} from 'mask';
import {$slot, attributeIn, attributeOut, element, host, PersonaContext, slotted, stringParser, style} from 'persona';
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

import template from './d6.html';


/**
 * The D6's API.
 *
 * @thModule piece
 */
export const $d6 = {
  api: {
    objectPath: attributeIn('object-path', objectPathParser<D6Spec>()),
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


export function d6Spec(partial: Partial<D6Spec>): D6Spec {
  return {
    currentFaceIndex: mutableState(0),
    rotationDeg: mutableState(0),
    ...partial,
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
    super(context, $, $.host._.objectPath);
    this.addSetup(renderMultifaced(this.objectSpec$, $.face._.name, context));
    this.addSetup(renderRotatable(this.objectSpec$, this.inputs.face.slotted, context));
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
          flipAction,
          compileConfig($.host._.flipAction, this.context),
          'Flip',
      ),
      this.createActionSpec(
          turnAction,
          compileConfig($.host._.turnAction, this.context),
          'Turn',
      ),
      this.createActionSpec(
          rollAction,
          compileConfig($.host._.rollAction, this.context),
          'Roll',
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

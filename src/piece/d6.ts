import {cache} from 'gs-tools/export/data';
import {Modifier} from 'gs-tools/export/state';
import {_p} from 'mask';
import {$slot, attributeOut, element, host, PersonaContext, slotted, stringParser, style} from 'persona';
import {Observable} from 'rxjs';

import {ActionSpec, TriggerConfig} from '../action/action-spec';
import {flipAction, flipActionConfigSpecs} from '../action/flip-action';
import {pickAction, pickActionConfigSpecs} from '../action/pick-action';
import {rollAction, rollActionConfigSpecs} from '../action/roll-action';
import {rotateAction, rotateActionConfigSpecs} from '../action/rotate-action';
import {turnAction, turnActionConfigSpecs} from '../action/turn-action';
import {compileConfig} from '../action/util/compile-config';
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


export function d6Spec(partial: Partial<D6Spec>, x: Modifier): D6Spec {
  return {
    $currentFaceIndex: partial.$currentFaceIndex ?? x.add(0),
    $rotationDeg: partial.$rotationDeg ?? x.add(0),
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
    super(context, $);
    this.addSetup(renderMultifaced(this.objectSpec$, $.face._.name, context));
    this.addSetup(renderRotatable(this.objectSpec$, this.inputs.face.slotted, context));
  }

  @cache()
  protected get actions(): ReadonlyArray<ActionSpec<TriggerConfig>> {
    return [
      rotateAction(compileConfig($.host._.rotateAction, this.context)),
      flipAction(compileConfig($.host._.flipAction, this.context)),
      turnAction(compileConfig($.host._.turnAction, this.context)),
      rollAction(compileConfig($.host._.rollAction, this.context)),
      pickAction(compileConfig($.host._.pickAction, this.context)),
    ];
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [];
  }
}

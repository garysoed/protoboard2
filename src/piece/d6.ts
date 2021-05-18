import {cache} from 'gs-tools/export/data';
import {StateId} from 'gs-tools/export/state';
import {_p} from 'mask';
import {$slot, attributeOut, element, host, PersonaContext, slotted, stringParser, style} from 'persona';
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
import {pieceSpec, PieceSpec} from '../types/piece-spec';

import template from './d6.html';


/**
 * The D6's API.
 *
 * @thModule piece
 */
export const $d6 = {
  api: {...$baseComponent.api},
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

export type D6Spec = PieceSpec<IsMultifaced&IsRotatable>;

interface Input<P> {
  readonly type: string;
  readonly payload: P;
  readonly $currentFaceIndex: StateId<number>;
  readonly $rotationDeg: StateId<number>;
}

export function d6Spec<P>(input: Input<P>): D6Spec {
  return pieceSpec({
    type: input.type,
    payload: {
      ...input.payload,
      $currentFaceIndex: input.$currentFaceIndex,
      $rotationDeg: input.$rotationDeg,
    },
  });
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
          rotateAction({stops: [0, 90, 180, 270]}, TriggerType.R),
          flipAction({count: 4}, TriggerType.F),
          turnAction({count: 4}, TriggerType.T),
          rollAction({count: 4}, TriggerType.L),
          pickAction(TriggerType.CLICK),
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

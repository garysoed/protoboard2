import {cache} from 'gs-tools/export/data';
import {Modifier, StateId} from 'gs-tools/export/state';
import {_p} from 'mask';
import {$slot, element, host, PersonaContext, slotted} from 'persona';
import {Observable} from 'rxjs';

import {pickAction} from '../action/pick-action';
import {rotateAction} from '../action/rotate-action';
import {$baseComponent, BaseComponent} from '../core/base-component';
import {TriggerType} from '../core/trigger-spec';
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
  api: {...$baseComponent.api},
};

export type D1Spec = IsRotatable;

interface Input<P> {
  readonly type: string;
  readonly payload: P;
  readonly $rotationDeg?: StateId<number>;
}

export function d1Spec<P>(input: Input<P>, x: Modifier): D1Spec {
  return {
    $rotationDeg: input.$rotationDeg ?? x.add(0),
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
    super(
        [
          rotateAction({stops: [0, 90, 180, 270], trigger: TriggerType.R}),
          pickAction({trigger: TriggerType.CLICK}),
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

import { _p } from 'mask';
import { PersonaContext } from 'persona';

import { MovablePayload } from '../action/payload/movable-payload';
import { PickAction } from '../action/pick-action';
import { $baseComponent, BaseComponent } from '../core/base-component';
import { TriggerSpec } from '../core/trigger-spec';

import template from './d1.html';


// import { RotateAction } from '../action/rotate-action';

/**
 * The D1's API.
 *
 * @thModule piece
 */
export const $d1 = {
  tag: 'pb-d1',
  api: {...$baseComponent.api},
};

// tslint:disable-next-line: no-empty-interface
export interface D1Payload extends MovablePayload { }

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
export class D1 extends BaseComponent<MovablePayload> {
  /**
   * @internal
   */
  constructor(context: PersonaContext) {
    super(
        new Map([
          [TriggerSpec.CLICK, PickAction],
          // [TriggerSpec.R, new RotateAction(0, [0, 90, 180, 270], context.vine)],
        ]),
        context,
    );
  }
}

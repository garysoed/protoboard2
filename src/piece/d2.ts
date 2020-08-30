import { instanceofType } from 'gs-types';
import { _p } from 'mask';
import { api, attributeOut, element, host, PersonaContext, stringParser } from 'persona';

import { MovablePayload } from '../action/payload/movable-payload';
import { RotatablePayload } from '../action/payload/rotatable-payload';
import { PickAction } from '../action/pick-action';
import { RotateAction } from '../action/rotate-action';
// import { $face } from '../action/face';
// import { FlipAction } from '../action/flip-action';
// import { PickAction } from '../../src/action/pick-action';
// import { RollAction } from '../action/roll-action';
// import { RotateAction } from '../action/rotate-action';
// import { BaseAction } from '../core/base-action';
import { BaseActionCtor, BaseComponent } from '../core/base-component';
import { TriggerSpec, UnreservedTriggerSpec } from '../core/trigger-spec';

import template from './d2.html';

/**
 * The D2's API.
 *
 * @thModule piece
 */
export const $d2 = {
  api: {
    // ...$face
  },
  tag: 'pb-d2',
};

export const $ = {
  host: host(api($d2.api)),
  face: element('face', instanceofType(HTMLSlotElement), {
    name: attributeOut('name', stringParser()),
  }),
};

interface D2Payload extends MovablePayload, RotatablePayload {

}

/**
 * Represents an object with two faces.
 *
 * @remarks
 * D2 supports {@link PickAction}, {@link RotateAction}., {@link FlipAction} and
 * {@link RollAction}.
 *
 * @thSlot - Face to display for the object.
 * @thWebComponent
 * @thModule piece
 */
@_p.customElement({
  ...$d2,
  template,
})
export class D2 extends BaseComponent<D2Payload> {
  // private readonly currentFace$ = this.declareInput($.host._.currentFaceOut);

  constructor(context: PersonaContext) {
    super(
        new Map<UnreservedTriggerSpec, BaseActionCtor<D2Payload, any>>([
          [TriggerSpec.CLICK, context => new PickAction(context)],
          [
            TriggerSpec.R,
            context => new RotateAction(context, {index: 0, stops: [0, 90, 180, 270]}),
          ],
          // [TriggerSpec.F, new FlipAction(2, 0, context.vine)],
          // [TriggerSpec.L, new RollAction({count: 2}, context.vine)],
        ]),
        context,
    );
    // this.render($.face._.name, this.renderFaceName());
  }

  // private renderFaceName(): Observable<string> {
  //   return this.currentFace$.pipe(
  //       map(currentFace => `face-${currentFace}`),
  //   );
  // }
}

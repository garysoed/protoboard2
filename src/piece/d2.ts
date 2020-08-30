import { cache } from 'gs-tools/export/data';
import { instanceofType } from 'gs-types';
import { _p } from 'mask';
import { api, attributeOut, element, host, PersonaContext, stringParser } from 'persona';
import { Observable, of as observableOf } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

// import { FlipAction } from '../action/flip-action';
import { MovablePayload } from '../action/payload/movable-payload';
import { OrientablePayload } from '../action/payload/orientable-payload';
import { RotatablePayload } from '../action/payload/rotatable-payload';
import { PickAction } from '../action/pick-action';
import { RotateAction } from '../action/rotate-action';
// import { $face } from '../action/face';
// import { FlipAction } from '../action/flip-action';
// import { RollAction } from '../action/roll-action';
import { BaseActionCtor, BaseComponent } from '../core/base-component';
import { TriggerSpec, UnreservedTriggerSpec } from '../core/trigger-spec';

import template from './d2.html';

/**
 * The D2's API.
 *
 * @thModule piece
 */
export const $d2 = {
  api: {},
  tag: 'pb-d2',
};

export const $ = {
  host: host(api($d2.api)),
  face: element('face', instanceofType(HTMLSlotElement), {
    name: attributeOut('name', stringParser()),
  }),
};

interface D2Payload extends MovablePayload, OrientablePayload, RotatablePayload {

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
  constructor(context: PersonaContext) {
    super(
        new Map<UnreservedTriggerSpec, BaseActionCtor<D2Payload, any>>([
          [TriggerSpec.CLICK, context => new PickAction(context)],
          [
            TriggerSpec.R,
            context => new RotateAction(context, {stops: [0, 90, 180, 270]}),
          ],
          // [TriggerSpec.F, context => new FlipAction(context, {count: 2})],
          // [TriggerSpec.L, new RollAction({count: 2}, context.vine)],
        ]),
        context,
    );
    this.render($.face._.name, this.faceName$);
  }

  @cache()
  private get faceName$(): Observable<string> {
    return this.state$.pipe(
        switchMap(state => {
          if (!state) {
            return observableOf(0);
          }

          return state.payload.faceIndex;
        }),
        map(index => `face-${index}`),
    );
  }
}

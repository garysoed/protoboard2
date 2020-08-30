import { instanceofType } from 'gs-types';
import { _p } from 'mask';
import { api, attributeOut, element, host, PersonaContext, stringParser } from 'persona';

// import { $face } from '../action/face';
// import { FlipAction } from '../action/flip-action';
// import { PickAction } from '../../src/action/pick-action';
// import { RollAction } from '../action/roll-action';
// import { RotateAction } from '../action/rotate-action';
// import { BaseAction } from '../core/base-action';
import { BaseActionCtor, BaseComponent } from '../core/base-component';
import { UnreservedTriggerSpec } from '../core/trigger-spec';

import template from './d2.html';


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

interface D2Payload {

}

@_p.customElement({
  ...$d2,
  template,
})
export class D2 extends BaseComponent<D2Payload> {
  // private readonly currentFace$ = this.declareInput($.host._.currentFaceOut);

  constructor(context: PersonaContext) {
    super(
        new Map<UnreservedTriggerSpec, BaseActionCtor<D2Payload, any>>([
          // [TriggerSpec.CLICK, new PickAction(context.vine)],
          // [TriggerSpec.R, new RotateAction(0, [0, 90, 180, 270], context.vine)],
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

import { InstanceofType } from 'gs-types';
import { _p } from 'mask';
import { api, attributeOut, element, PersonaContext, stringParser } from 'persona';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { $face } from '../action/face';
import { FlipAction } from '../action/flip-action';
import { PickAction } from '../action/pick-action';
import { RollAction } from '../action/roll-action';
import { RotateAction } from '../action/rotate-action';
import { BaseAction } from '../core/base-action';
import { BaseComponent } from '../core/base-component';
import { TriggerSpec, UnreservedTriggerSpec } from '../core/trigger-spec';

import template from './d2.html';


export const $ = {
  host: element(api($face)),
  face: element('face', InstanceofType(HTMLSlotElement), {
    name: attributeOut('name', stringParser()),
  }),
};

@_p.customElement({
  tag: 'pb-d2',
  template,
})
export class D2 extends BaseComponent {
  private readonly currentFace$ = this.declareInput($.host._.currentFaceOut);

  constructor(context: PersonaContext) {
    super(
        new Map<UnreservedTriggerSpec, BaseAction>([
          [TriggerSpec.CLICK, new PickAction(context.vine)],
          [TriggerSpec.R, new RotateAction(0, [0, 90, 180, 270], context.vine)],
          [TriggerSpec.F, new FlipAction(2, 0, context.vine)],
          [TriggerSpec.L, new RollAction({count: 2}, context.vine)],
        ]),
        context,
    );
    this.render($.face._.name).withFunction(this.renderFaceName);
  }

  private renderFaceName(): Observable<string> {
    return this.currentFace$.pipe(
        map(currentFace => `face-${currentFace}`),
    );
  }
}

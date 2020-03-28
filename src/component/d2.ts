import { InstanceofType } from 'gs-types';
import { _p } from 'mask';
import { api, attributeOut, element, PersonaContext, stringParser } from 'persona';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { $$ as $flipAction, FlipAction } from '../action/flip-action';
import { PickAction } from '../action/pick-action';
import { RollAction } from '../action/roll-action';
import { RotateAction } from '../action/rotate-action';
import { BaseComponent } from '../core/base-component';

import template from './d2.html';


export const $ = {
  host: element(api($flipAction)),
  face: element('face', InstanceofType(HTMLSlotElement), {
    name: attributeOut('name', stringParser()),
  }),
};

@_p.customElement({
  tag: 'pb-d2',
  template,
})
export class D2 extends BaseComponent {
  private readonly currentFace$ = this.declareInput($.host._.currentFace);

  constructor(context: PersonaContext) {
    super(
        [
          new PickAction(context),
          new RotateAction(0, [0, 90, 180, 270], context),
          new FlipAction(2, 0, context),
          new RollAction({count: 2}, context),
        ],
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

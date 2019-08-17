import { InstanceofType } from '@gs-types';
import { _p, _v, stringParser } from '@mask';
import { api, attributeOut, element, InitFn } from '@persona';
import { Observable } from '@rxjs';
import { map } from '@rxjs/operators';

import { $$ as $flipAction, FlipAction } from '../action/flip-action';
import { PickAction } from '../action/pick-action';
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
  private readonly currentFace$ = _p.input($.host._.currentFace, this);

  constructor(shadowRoot: ShadowRoot) {
    super(
        [
          new PickAction(),
          new RotateAction(0, [0, 90, 180, 270]),
          new FlipAction(2, 0),
        ],
        shadowRoot,
    );
  }

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.face._.name).withVine(_v.stream(this.renderFaceName, this)),
    ];
  }

  private renderFaceName(): Observable<string> {
    return this.currentFace$.pipe(
        map(currentFace => `face-${currentFace}`),
    );
  }
}

import { _p } from 'mask';
import { PersonaContext } from 'persona';

import { PickAction } from '../action/pick-action';
import { RotateAction } from '../action/rotate-action';
import { BaseComponent } from '../core/base-component';

import template from './d1.html';


@_p.customElement({
  tag: 'pb-d1',
  template,
})
export class D1 extends BaseComponent {
  constructor(context: PersonaContext) {
    super(
        [
          new PickAction(context),
          new RotateAction(0, [0, 90, 180, 270], context),
        ],
        context,
    );
  }
}

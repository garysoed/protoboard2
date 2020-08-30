import { _p, ThemedCustomElementCtrl } from 'mask';
import { PersonaContext, renderCustomElement } from 'persona';
import { of as observableOf } from 'rxjs';

import { $slot, Slot } from '../../src/container/slot';
import { Supply } from '../../src/region/supply';
import { Render } from '../../src/state/render';
import { registerStateHandler } from '../../src/state/state-service';

import template from './play-area.html';
import { ROOT_SLOT_TYPE } from './staging-area';


@_p.customElement({
  dependencies: [
    Render,
    Slot,
    Supply,
  ],
  configure: vine => {
    registerStateHandler(
        ROOT_SLOT_TYPE,
        (state, context) => {
          return renderCustomElement(
              $slot,
              {inputs: {objectId: observableOf(state.id)}},
              context,
          );
        },
        vine,
    );
  },
  tag: 'pbd-play-area',
  template,
  api: {},
})
export class PlayArea extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);
  }
}

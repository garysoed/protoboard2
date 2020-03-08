import { _p, ThemedCustomElementCtrl } from 'mask';

import { ZoneTemplate } from '../template/zone-template';

import template from './slot.html';

@_p.customElement({
  tag: 'pbd-slot',
  template,
  dependencies: [
    ZoneTemplate,
  ],
})
export class Slot extends ThemedCustomElementCtrl {

}

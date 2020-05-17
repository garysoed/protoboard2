import { _p, ThemedCustomElementCtrl } from 'mask';

import { Slot as SlotImpl } from '../../src/zone/slot';
import { ZoneTemplate } from '../template/zone-template';

import template from './slot.html';

@_p.customElement({
  tag: 'pbd-slot',
  template,
  dependencies: [
    SlotImpl,
    ZoneTemplate,
  ],
  api: {},
})
export class Slot extends ThemedCustomElementCtrl {

}

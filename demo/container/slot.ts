import { _p, ThemedCustomElementCtrl } from 'mask';

import { Slot as SlotImpl } from '../../src/container/slot';
// import { ZoneTemplate } from '../template/zone-template';

import template from './slot.html';

export const $slot = {
  tag: 'pbd-slot',
  api: {},
};

@_p.customElement({
  ...$slot,
  template,
  dependencies: [
    SlotImpl,
    // ZoneTemplate,
  ],
})
export class Slot extends ThemedCustomElementCtrl {

}

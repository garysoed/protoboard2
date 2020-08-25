import { _p, ThemedCustomElementCtrl } from 'mask';

import { Slot as SlotImpl } from '../../src/container/slot';
import { ContainerTemplate } from '../template/container-template';

import template from './slot.html';

export const $slot = {
  tag: 'pbd-slot',
  api: {},
};

@_p.customElement({
  ...$slot,
  template,
  dependencies: [
    ContainerTemplate,
    SlotImpl,
  ],
})
export class Slot extends ThemedCustomElementCtrl {

}

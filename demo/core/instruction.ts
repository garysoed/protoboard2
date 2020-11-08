import {_p, ThemedCustomElementCtrl} from 'mask';

import template from './instruction.html';

export const $instruction = {
  tag: 'pbd-instruction',
  api: {},
};

@_p.customElement({
  ...$instruction,
  template,
})
export class Instruction extends ThemedCustomElementCtrl {

}

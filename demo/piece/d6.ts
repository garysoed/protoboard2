import {Icon, ThemedCustomElementCtrl, _p} from 'mask';

import {D6} from '../../src/piece/d6';
import {PieceTemplate} from '../template/piece-template';

import template from './d6.html';


export const $d6Demo = {
  tag: 'pbd-d6',
  api: {},
};

@_p.customElement({
  ...$d6Demo,
  dependencies: [
    PieceTemplate,
    Icon,
    D6,
  ],
  template,
})
export class D6Demo extends ThemedCustomElementCtrl {
}

import {Icon, ThemedCustomElementCtrl, _p} from 'mask';

import {D1} from '../../src/piece/d1';
import {PieceTemplate} from '../template/piece-template';

import template from './d1.html';


export const $d1Demo = {
  tag: 'pbd-d1',
  api: {},
};


@_p.customElement({
  ...$d1Demo,
  dependencies: [
    PieceTemplate,
    Icon,
    D1,
  ],
  template,
})
export class D1Demo extends ThemedCustomElementCtrl {
}

import { _p, Icon, ThemedCustomElementCtrl } from 'mask';
import { element } from 'persona';

import { D2 } from '../../src/piece/d2';
import { $pieceTemplate, PieceTemplate } from '../template/piece-template';

import template from './d2.html';


export const $d2Demo = {
  tag: 'pbd-d2',
  api: {},
};

const $ = {
  template: element('template', $pieceTemplate, {}),
};

@_p.customElement({
  ...$d2Demo,
  dependencies: [
    PieceTemplate,
    Icon,
    D2,
  ],
  template,
})
export class D2Demo extends ThemedCustomElementCtrl {
}

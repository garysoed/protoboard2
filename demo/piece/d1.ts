import { _p, Icon, ThemedCustomElementCtrl } from 'mask';
import { element } from 'persona';

import { D1 } from '../../src/piece/d1';
import { $pieceTemplate, PieceTemplate } from '../template/piece-template';

import template from './d1.html';


export const $d1Demo = {
  tag: 'pbd-d1',
  api: {},
};

const $ = {
  template: element('template', $pieceTemplate, {}),
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

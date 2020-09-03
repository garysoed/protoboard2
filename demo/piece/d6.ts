import { _p, Icon, ThemedCustomElementCtrl } from 'mask';
import { element } from 'persona';

import { D6 } from '../../src/piece/d6';
import { $pieceTemplate, PieceTemplate } from '../template/piece-template';

import template from './d6.html';


export const $d6Demo = {
  tag: 'pbd-d6',
  api: {},
};

const $ = {
  template: element('template', $pieceTemplate, {}),
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

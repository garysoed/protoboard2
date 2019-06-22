import { $svgConfig, _p, Icon, ThemedCustomElementCtrl } from '@mask';
import { Piece as PieceComponent } from '../../src/component/piece';
import meepleSvg from '../asset/meeple.svg';
import template from './piece.html';

@_p.customElement({
  configure: vine => {
    $svgConfig.get(vine).next({
      key: 'meeple',
      type: 'set',
      value: {type: 'embed', content: meepleSvg},
    });
  },
  dependencies: [
    PieceComponent,
    Icon,
  ],
  tag: 'pbd-piece',
  template,
})
export class Piece extends ThemedCustomElementCtrl {

}

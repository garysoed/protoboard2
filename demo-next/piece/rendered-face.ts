import {cache} from 'gs-tools/export/data';
import {ICON, registerSvg, renderTheme} from 'mask';
import {Context, Ctrl, H3, iattr, id, otext, P, registerCustomElement} from 'persona';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import cardBackSvg from '../asset/card_back.svg';
import cardFrontSvg from '../asset/card_front.svg';
import coinFrontSvg from '../asset/coin.svg';
import coinBackSvg from '../asset/coin_back.svg';
import dicePip1Svg from '../asset/dice_pip_1.svg';
import dicePip2Svg from '../asset/dice_pip_2.svg';
import dicePip3Svg from '../asset/dice_pip_3.svg';
import dicePip4Svg from '../asset/dice_pip_4.svg';
import dicePip5Svg from '../asset/dice_pip_5.svg';
import dicePip6Svg from '../asset/dice_pip_6.svg';
import gemSvg from '../asset/gem.svg';
import meepleSvg from '../asset/meeple.svg';

import template from './rendered-face.html';


export enum FaceType {
  CARD_BACK = 'cardback',
  CARD_FRONT = 'cardfront',
  COIN_BACK = 'coinback',
  COIN_FRONT = 'coinfront',
  DICE_PIP_1 = 'dicepip1',
  DICE_PIP_2 = 'dicepip2',
  DICE_PIP_3 = 'dicepip3',
  DICE_PIP_4 = 'dicepip4',
  DICE_PIP_5 = 'dicepip5',
  DICE_PIP_6 = 'dicepip6',
  GEM = 'gem',
  MEEPLE = 'meeple',
}

const $renderedFace = {
  host: {
    faceType: iattr('face-type'),
  },
  shadow: {
    icon: id('icon', ICON),
    name: id('name', H3, {
      text: otext(),
    }),
    details: id('details', P),
  },
};


class RenderedFace implements Ctrl {
  constructor(private readonly $: Context<typeof $renderedFace>) { }

  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      this.icon$.pipe(this.$.shadow.icon.icon()),
      this.faceName$.pipe(this.$.shadow.name.text()),
    ];
  }

  @cache()
  private get icon$(): Observable<string> {
    return this.$.host.faceType.pipe(map(faceType => faceType ?? ''));
  }

  @cache()
  private get faceName$(): Observable<string> {
    return this.$.host.faceType.pipe(
        map(faceType => {
          switch (faceType) {
            case FaceType.CARD_BACK:
              return 'Card Back';
            case FaceType.CARD_FRONT:
              return 'Card Front';
            case FaceType.COIN_BACK:
              return 'Coin Back';
            case FaceType.COIN_FRONT:
              return 'Coin Front';
            case FaceType.DICE_PIP_1:
              return 'Dice 1 (pip)';
            case FaceType.DICE_PIP_2:
              return 'Dice 2 (pip)';
            case FaceType.DICE_PIP_3:
              return 'Dice 3 (pip)';
            case FaceType.DICE_PIP_4:
              return 'Dice 4 (pip)';
            case FaceType.DICE_PIP_5:
              return 'Dice 5 (pip)';
            case FaceType.DICE_PIP_6:
              return 'Dice 6 (pip)';
            case FaceType.GEM:
              return 'Gem';
            case FaceType.MEEPLE:
              return 'Meeple';
            default:
              return '';
          }
        }),
    );
  }
}

export const RENDERED_FACE = registerCustomElement({
  configure: vine => {
    registerSvg(vine, FaceType.CARD_BACK, {type: 'embed', content: cardBackSvg});
    registerSvg(vine, FaceType.CARD_FRONT, {type: 'embed', content: cardFrontSvg});
    registerSvg(vine, FaceType.COIN_BACK, {type: 'embed', content: coinBackSvg});
    registerSvg(vine, FaceType.COIN_FRONT, {type: 'embed', content: coinFrontSvg});
    registerSvg(vine, FaceType.GEM, {type: 'embed', content: gemSvg});
    registerSvg(vine, FaceType.MEEPLE, {type: 'embed', content: meepleSvg});
    registerSvg(vine, FaceType.DICE_PIP_1, {type: 'embed', content: dicePip1Svg});
    registerSvg(vine, FaceType.DICE_PIP_2, {type: 'embed', content: dicePip2Svg});
    registerSvg(vine, FaceType.DICE_PIP_3, {type: 'embed', content: dicePip3Svg});
    registerSvg(vine, FaceType.DICE_PIP_4, {type: 'embed', content: dicePip4Svg});
    registerSvg(vine, FaceType.DICE_PIP_5, {type: 'embed', content: dicePip5Svg});
    registerSvg(vine, FaceType.DICE_PIP_6, {type: 'embed', content: dicePip6Svg});
  },
  ctrl: RenderedFace,
  deps: [
    ICON,
  ],
  spec: $renderedFace,
  tag: 'pbd-rendered-face',
  template,
});
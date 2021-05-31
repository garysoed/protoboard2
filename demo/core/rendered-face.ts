import {cache} from 'gs-tools/export/data';
import {$icon, BaseThemedCtrl, Icon, registerSvg, _p} from 'mask';
import {$h3, $p, attributeIn, element, enumParser, host, PersonaContext} from 'persona';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {Lens} from '../../src/face/lens';
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

export const $renderedFace = {
  tag: 'pbd-rendered-face',
  api: {
    faceType: attributeIn('face-type', enumParser<FaceType>(FaceType)),
  },
};

const $ = {
  host: host($renderedFace.api),
  icon: element('icon', $icon, {}),
  name: element('name', $h3, {}),
  details: element('details', $p, {}),
};

@_p.customElement({
  ...$renderedFace,
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
  dependencies: [
    Icon,
    Lens,
  ],
  template,
})
export class RenderedFace extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.icon.icon(this.icon$),
      this.renderers.name.textContent(this.faceName$),
    ];
  }

  @cache()
  private get icon$(): Observable<string> {
    return this.inputs.host.faceType.pipe(map(faceType => faceType ?? ''));
  }

  @cache()
  private get faceName$(): Observable<string> {
    return this.inputs.host.faceType.pipe(
        map(faceType => {
          if (!faceType) {
            return '';
          }

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
          }
        }),
    );
  }
}
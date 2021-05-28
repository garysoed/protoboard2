import {cache} from 'gs-tools/export/data';
import {$icon, BaseThemedCtrl, Icon, registerSvg, _p} from 'mask';
import {$h3, $p, attributeIn, element, enumParser, host, PersonaContext} from 'persona';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {Lens} from '../../src/core/lens';
import cardBackSvg from '../asset/card_back.svg';
import cardFrontSvg from '../asset/card_front.svg';
import coinFrontSvg from '../asset/coin.svg';
import coinBackSvg from '../asset/coin_back.svg';
import gemSvg from '../asset/gem.svg';
import meepleSvg from '../asset/meeple.svg';


import template from './rendered-face.html';

export enum FaceType {
  CARD_BACK = 'cardback',
  CARD_FRONT = 'cardfront',
  COIN_BACK = 'coinback',
  COIN_FRONT = 'coinfront',
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
            case FaceType.GEM:
              return 'Gem';
            case FaceType.MEEPLE:
              return 'Meeple';
          }
        }),
    );
  }
}
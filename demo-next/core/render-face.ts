import {Vine} from 'grapevine';
import {$svgService, registerSvg} from 'mask';
import {Length, ostyle, ParseType, query, renderString, SVG} from 'persona';
import {OStyle} from 'persona/export/internal';
import {of} from 'rxjs';
import {map} from 'rxjs/operators';

import {SvgRenderSpec} from '../../src-next/renderspec/render-stamp-spec';
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

export const FACE_SIZE_PX = 48;

interface Options {
  readonly x?: Length;
  readonly y?: Length;
}

export function renderDemoFace(vine: Vine, faceType: FaceType, options: Options = {}): SvgRenderSpec {
  const svg$ = $svgService.get(vine).getSvg(faceType);
  return renderString({
    // TODO: Remove the ??
    raw: svg$.pipe(map(content => content ?? '')),
    spec: {
      root: query(null, SVG, {}),
      foreground: query<SVGElement, {}, {style: OStyle<'fill'>}>('#foreground', null, {
        style: ostyle('fill'),
      }),
    },
    parseType: ParseType.SVG,
    runs: $ => {
      const obsList = [
        of('var(--mkThemePassiveFG2)').pipe($.foreground.style()),
        of(`${FACE_SIZE_PX}px` as const).pipe($.root.width()),
        of(`${FACE_SIZE_PX}px` as const).pipe($.root.height()),
      ];

      if (options.x !== undefined) {
        obsList.push(of(options.x).pipe($.root.x()));
      }

      if (options.y !== undefined) {
        obsList.push(of(options.y).pipe($.root.y()));
      }

      return obsList;
    },
  });
}

export function registerFaceSvgs(vine: Vine): void {
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
}


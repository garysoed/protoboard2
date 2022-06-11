import {$stateService, source, Vine} from 'grapevine';
import {mutableState} from 'gs-tools/export/state';
import {enumType} from 'gs-types';
import {renderElement, renderHtml, RenderSpec} from 'persona';
import {of} from 'rxjs';

import {faceId} from '../src-next/id/face-id';
import {D1, D1State, d1State} from '../src-next/piece/d1';
import {D2, d2State, D2State} from '../src-next/piece/d2';
import {D6, d6State, D6State} from '../src-next/piece/d6';
import {slotState, SurfaceState} from '../src-next/region/surface';

import {FaceType, RENDERED_FACE} from './piece/rendered-face';


export interface DemoState {
  d1: {
    gemSlot: SurfaceState;
    meepleSlot: SurfaceState;
  };
  d2: {
    cardSlot: SurfaceState;
    coinSlot: SurfaceState;
  },
  d6: {
    diceSlot: SurfaceState;
  },
  pieces: {
    card: D2State,
    coin: D2State,
    dice: D6State,
    gem: D1State,
    meeple: D1State,
  },
}

enum ComponentType {
  CARD = 'card',
  COIN = 'coin',
  DICE = 'dice',
  GEM = 'gem',
  MEEPLE = 'meeple',
}

export const $state$ = source(vine => $stateService.get(vine).addRoot<DemoState>({
  d1: {
    gemSlot: slotState({}, {contentIds: mutableState([ComponentType.GEM])}),
    meepleSlot: slotState({}, {contentIds: mutableState([ComponentType.MEEPLE])}),
  },
  d2: {
    cardSlot: slotState({}, {contentIds: mutableState([ComponentType.CARD])}),
    coinSlot: slotState({}, {contentIds: mutableState([ComponentType.COIN])}),
  },
  d6: {
    diceSlot: slotState({}, {contentIds: mutableState([ComponentType.DICE])}),
  },
  pieces: {
    card: d2State(ComponentType.CARD, [faceId(FaceType.CARD_BACK), faceId(FaceType.CARD_FRONT)]),
    coin: d2State(ComponentType.COIN, [faceId(FaceType.COIN_BACK), faceId(FaceType.CARD_FRONT)]),
    dice: d6State(
        ComponentType.DICE,
        [
          faceId(FaceType.DICE_PIP_1),
          faceId(FaceType.DICE_PIP_2),
          faceId(FaceType.DICE_PIP_3),
          faceId(FaceType.DICE_PIP_4),
          faceId(FaceType.DICE_PIP_5),
          faceId(FaceType.DICE_PIP_6),
        ],
    ),
    gem: d1State(ComponentType.GEM, faceId(FaceType.GEM)),
    meeple: d1State(ComponentType.MEEPLE, faceId(FaceType.MEEPLE)),
  },
})._());

export function renderComponent(id: unknown, vine: Vine): RenderSpec {
  if (!enumType<ComponentType>(ComponentType).check(id)) {
    throw new Error('ID is not ComponentType');
  }
  const state$ = $state$.get(vine);
  switch (id) {
    case ComponentType.CARD:
      return renderElement({
        registration: D2,
        spec: {},
        runs: $ => [of(state$._('pieces')._('card')).pipe($.state())],
      });
    case ComponentType.COIN:
      return renderElement({
        registration: D2,
        spec: {},
        runs: $ => [of(state$._('pieces')._('coin')).pipe($.state())],
      });
    case ComponentType.DICE:
      return renderElement({
        registration: D6,
        spec: {},
        runs: $ => [of(state$._('pieces')._('dice')).pipe($.state())],
      });
    case ComponentType.GEM:
      return renderElement({
        registration: D1,
        spec: {},
        runs: $ => [of(state$._('pieces')._('gem')).pipe($.state())],
      });
    case ComponentType.MEEPLE:
      return renderElement({
        registration: D1,
        spec: {},
        runs: $ => [of(state$._('pieces')._('meeple')).pipe($.state())],
      });
  }
}

export function renderFace(payload: unknown): RenderSpec {
  if (!enumType<FaceType>(FaceType).check(payload)) {
    throw new Error(`ID ${payload} is not a FaceType`);
  }

  return renderElement({
    registration: RENDERED_FACE,
    spec: {},
    runs: $ => [of(payload).pipe($.faceType())],
  });
}

export function renderLens(id: unknown): RenderSpec|null {
  if (!enumType<FaceType>(FaceType).check(id)) {
    return null;
  }

  return renderHtml({
    raw: of(`
    <div slot="details">
      <h3 id="name">${getFaceName(id)}</h3>
      <p mk-body-1>More detailed information on the piece goes here.</p>
    </div>`),
    parseType: 'text/html',
  });
}

function getFaceName(faceType: FaceType): string {
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
}
import {$stateService, source, Vine} from 'grapevine';
import {mutableState} from 'gs-tools/export/state';
import {enumType} from 'gs-types';
import {renderElement, renderString, RenderSpec, ParseType} from 'persona';
import {of} from 'rxjs';

import {ComponentId, componentId, getPayload as getComponentIdPayload} from '../src/id/component-id';
import {FaceId, faceId, getPayload as getFaceIdPayload} from '../src/id/face-id';
import {D1, D1State, d1State} from '../src/piece/d1';
import {D2, d2State, D2State} from '../src/piece/d2';
import {D6, d6State, D6State} from '../src/piece/d6';
import {deckState, DeckState} from '../src/region/deck';
import {padState, PadState} from '../src/region/pad/pad-state';
import {surfaceState, SurfaceState} from '../src/region/surface';

import {FaceType, renderDemoFace} from './core/render-face';


export interface DemoState {
  d1: {
    gemSlot: SurfaceState,
    meepleSlot: SurfaceState,
  },
  d2: {
    cardSlot: SurfaceState,
    coinSlot: SurfaceState,
  },
  d6: {
    diceSlot: SurfaceState,
  },
  deck: {
    deck: DeckState,
  },
  pad: {
    pad: PadState,
  },
  surface: {
    surface: SurfaceState,
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

const CARD_ID = componentId(ComponentType.CARD);
const COIN_ID = componentId(ComponentType.COIN);
const DICE_ID = componentId(ComponentType.DICE);
const GEM_ID = componentId(ComponentType.GEM);
const MEEPLE_ID = componentId(ComponentType.MEEPLE);

export const $state$ = source(vine => $stateService.get(vine).addRoot<DemoState>({
  d1: {
    gemSlot: surfaceState(componentId({}), {contentIds: mutableState([GEM_ID])}),
    meepleSlot: surfaceState(componentId({}), {contentIds: mutableState([MEEPLE_ID])}),
  },
  d2: {
    cardSlot: surfaceState(componentId({}), {contentIds: mutableState([CARD_ID])}),
    coinSlot: surfaceState(componentId({}), {contentIds: mutableState([COIN_ID])}),
  },
  d6: {
    diceSlot: surfaceState(componentId({}), {contentIds: mutableState([DICE_ID])}),
  },
  deck: {
    deck: deckState(componentId({})),
  },
  pad: {
    pad: padState(componentId({})),
  },
  surface: {
    surface: surfaceState(componentId({})),
  },
  pieces: {
    card: d2State(CARD_ID, [faceId(FaceType.CARD_BACK), faceId(FaceType.CARD_FRONT)]),
    coin: d2State(COIN_ID, [faceId(FaceType.COIN_BACK), faceId(FaceType.CARD_FRONT)]),
    dice: d6State(
        DICE_ID,
        [
          faceId(FaceType.DICE_PIP_1),
          faceId(FaceType.DICE_PIP_2),
          faceId(FaceType.DICE_PIP_3),
          faceId(FaceType.DICE_PIP_6),
          faceId(FaceType.DICE_PIP_5),
          faceId(FaceType.DICE_PIP_4),
        ],
    ),
    gem: d1State(GEM_ID, faceId(FaceType.GEM)),
    meeple: d1State(MEEPLE_ID, faceId(FaceType.MEEPLE)),
  },
})._());

export function renderComponent(id: ComponentId<unknown>, vine: Vine): RenderSpec {
  const payload = getComponentIdPayload(id);
  if (!enumType<ComponentType>(ComponentType).check(payload)) {
    throw new Error('ID is not ComponentType');
  }
  const state$ = $state$.get(vine);
  switch (payload) {
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

export function renderFace(id: FaceId<unknown>, vine: Vine): RenderSpec|null {
  const payload = getFaceIdPayload(id);
  if (!enumType<FaceType>(FaceType).check(payload)) {
    throw new Error(`ID ${payload} is not a FaceType`);
  }

  return renderDemoFace(vine, payload);
}

export function renderLens(id: FaceId<unknown>): RenderSpec|null {
  const payload = getFaceIdPayload(id);
  if (!enumType<FaceType>(FaceType).check(payload)) {
    return null;
  }

  return renderString({
    raw: of(`
    <div slot="details">
      <h3 id="name">${getFaceName(payload)}</h3>
      <p mk-body-1>More detailed information on the piece goes here.</p>
    </div>`),
    parseType: ParseType.HTML,
    spec: {},
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
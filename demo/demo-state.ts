import {source, Vine} from 'grapevine';
import {enumType} from 'gs-types';
import {ParseType, renderElement, RenderSpec, renderString} from 'persona';
import {BehaviorSubject, of} from 'rxjs';

import {ComponentId, componentId, getPayload as getComponentIdPayload} from '../src/id/component-id';
import {D1, D1State, d1State} from '../src/piece/d1';
import {D2, d2State, D2State} from '../src/piece/d2';
import {D6, d6State, D6State} from '../src/piece/d6';
import {deckState, DeckState} from '../src/region/deck';
import {padState, PadState} from '../src/region/pad/pad-state';
import {surfaceState, SurfaceState} from '../src/region/surface';
import {FaceSpec} from '../src/types/is-multifaced';

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

export const $state$ = source(vine => ({
  d1: {
    gemSlot: surfaceState(componentId({}), {contentIds: new BehaviorSubject<readonly ComponentId[]>([GEM_ID])}),
    meepleSlot: surfaceState(componentId({}), {contentIds: new BehaviorSubject<readonly ComponentId[]>([MEEPLE_ID])}),
  },
  d2: {
    cardSlot: surfaceState(componentId({}), {contentIds: new BehaviorSubject<readonly ComponentId[]>([CARD_ID])}),
    coinSlot: surfaceState(componentId({}), {contentIds: new BehaviorSubject<readonly ComponentId[]>([COIN_ID])}),
  },
  d6: {
    diceSlot: surfaceState(componentId({}), {contentIds: new BehaviorSubject<readonly ComponentId[]>([DICE_ID])}),
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
    card: d2State(
        CARD_ID,
        [faceSpec(vine, FaceType.CARD_BACK), faceSpec(vine, FaceType.CARD_FRONT)],
    ),
    coin: d2State(
        COIN_ID,
        [faceSpec(vine, FaceType.COIN_BACK), faceSpec(vine, FaceType.COIN_FRONT)],
    ),
    dice: d6State(
        DICE_ID,
        [
          faceSpec(vine, FaceType.DICE_PIP_1),
          faceSpec(vine, FaceType.DICE_PIP_2),
          faceSpec(vine, FaceType.DICE_PIP_3),
          faceSpec(vine, FaceType.DICE_PIP_6),
          faceSpec(vine, FaceType.DICE_PIP_5),
          faceSpec(vine, FaceType.DICE_PIP_4),
        ],
    ),
    gem: d1State(GEM_ID, faceSpec(vine, FaceType.GEM)),
    meeple: d1State(MEEPLE_ID, faceSpec(vine, FaceType.MEEPLE)),
  },
}));

export function renderComponent(id: ComponentId, vine: Vine): RenderSpec {
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
        runs: $ => [of(state$.pieces.card).pipe($.state())],
      });
    case ComponentType.COIN:
      return renderElement({
        registration: D2,
        spec: {},
        runs: $ => [of(state$.pieces.coin).pipe($.state())],
      });
    case ComponentType.DICE:
      return renderElement({
        registration: D6,
        spec: {},
        runs: $ => [of(state$.pieces.dice).pipe($.state())],
      });
    case ComponentType.GEM:
      return renderElement({
        registration: D1,
        spec: {},
        runs: $ => [of(state$.pieces.gem).pipe($.state())],
      });
    case ComponentType.MEEPLE:
      return renderElement({
        registration: D1,
        spec: {},
        runs: $ => [of(state$.pieces.meeple).pipe($.state())],
      });
  }
}

function faceSpec(vine: Vine, faceType: FaceType): FaceSpec {
  return {
    renderFn: () => renderDemoFace(vine, faceType),
    renderLensFn: () => renderLens(faceType),
  };
}

export function renderFace(faceType: FaceType, vine: Vine): RenderSpec|null {
  return renderDemoFace(vine, faceType);
}

export function renderLens(faceType: FaceType): RenderSpec|null {
  return renderString({
    raw: of(`
    <div slot="details">
      <h3 id="name">${getFaceName(faceType)}</h3>
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
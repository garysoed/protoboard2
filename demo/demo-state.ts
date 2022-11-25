import {source, Vine} from 'grapevine';
import {ParseType, renderElement, RenderSpec, renderString} from 'persona';
import {BehaviorSubject, of} from 'rxjs';

import {ComponentId} from '../src/id/component-id';
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

export const $state = source(vine => {
  const card = d2State(
      [faceSpec(vine, FaceType.CARD_BACK), faceSpec(vine, FaceType.CARD_FRONT)],
  );
  const coin = d2State(
      [faceSpec(vine, FaceType.COIN_BACK), faceSpec(vine, FaceType.COIN_FRONT)],
  );
  const dice = d6State(
      {
        label: 'dice',
        faces: [
          faceSpec(vine, FaceType.DICE_PIP_1),
          faceSpec(vine, FaceType.DICE_PIP_2),
          faceSpec(vine, FaceType.DICE_PIP_3),
          faceSpec(vine, FaceType.DICE_PIP_6),
          faceSpec(vine, FaceType.DICE_PIP_5),
          faceSpec(vine, FaceType.DICE_PIP_4),
        ],
      },
  );
  const gem = d1State({label: 'gem', face: faceSpec(vine, FaceType.GEM)});
  const meeple = d1State({label: 'meeple', face: faceSpec(vine, FaceType.MEEPLE)});
  return {
    d1: {
      gemSlot: surfaceState({contentIds: new BehaviorSubject<readonly ComponentId[]>([gem.id])}),
      meepleSlot: surfaceState({contentIds: new BehaviorSubject<readonly ComponentId[]>([meeple.id])}),
    },
    d2: {
      cardSlot: surfaceState({contentIds: new BehaviorSubject<readonly ComponentId[]>([card.id])}),
      coinSlot: surfaceState({contentIds: new BehaviorSubject<readonly ComponentId[]>([coin.id])}),
    },
    d6: {
      diceSlot: surfaceState({contentIds: new BehaviorSubject<readonly ComponentId[]>([dice.id])}),
    },
    deck: {
      deck: deckState({}),
    },
    pad: {
      pad: padState({}),
    },
    surface: {
      surface: surfaceState({}),
    },
    pieces: {
      card,
      coin,
      dice,
      gem,
      meeple,
    },
  };
});

export function renderComponent(id: ComponentId, vine: Vine): RenderSpec {
  const state = $state.get(vine);
  switch (id) {
    case state.pieces.card.id:
      return renderElement({
        registration: D2,
        spec: {},
        runs: $ => [of(state.pieces.card).pipe($.state())],
      });
    case state.pieces.coin.id:
      return renderElement({
        registration: D2,
        spec: {},
        runs: $ => [of(state.pieces.coin).pipe($.state())],
      });
    case state.pieces.dice.id:
      return renderElement({
        registration: D6,
        spec: {},
        runs: $ => [of(state.pieces.dice).pipe($.state())],
      });
    case state.pieces.gem.id:
      return renderElement({
        registration: D1,
        spec: {},
        runs: $ => [of(state.pieces.gem).pipe($.state())],
      });
    case state.pieces.meeple.id:
      return renderElement({
        registration: D1,
        spec: {},
        runs: $ => [of(state.pieces.meeple).pipe($.state())],
      });
    default:
      throw new Error(`Unhandled ID ${id}`);
  }
}

function faceSpec(vine: Vine, faceType: FaceType): FaceSpec {
  return {
    renderSpec$: of(renderDemoFace(vine, faceType)),
    renderLensSpec$: of(renderLens(faceType)),
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
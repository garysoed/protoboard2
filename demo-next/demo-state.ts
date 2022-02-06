import {$stateService, source, Vine} from 'grapevine';
import {mutableState} from 'gs-tools/export/state';
import {enumType} from 'gs-types';
import {renderCustomElement, renderHtml, RenderSpec} from 'persona';
import {of} from 'rxjs';

import {D1, D1State, d1State} from '../src-next/piece/d1';
import {D2, d2State, D2State} from '../src-next/piece/d2';
import {slotState, SlotState} from '../src-next/region/slot';

import {FaceType, RENDERED_FACE} from './piece/rendered-face';


export interface DemoState {
  d1: {
    gemSlot: SlotState;
    meepleSlot: SlotState;
  };
  d2: {
    cardSlot: SlotState;
    coinSlot: SlotState;
  }
  pieces: {
    card: D2State,
    coin: D2State,
    gem: D1State,
    meeple: D1State,
  },
}

enum ComponentType {
  CARD = 'card',
  COIN = 'coin',
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
  pieces: {
    card: d2State(ComponentType.CARD, [FaceType.CARD_BACK, FaceType.CARD_FRONT]),
    coin: d2State(ComponentType.COIN, [FaceType.COIN_BACK, FaceType.CARD_FRONT]),
    gem: d1State(ComponentType.GEM, [FaceType.GEM]),
    meeple: d1State(ComponentType.MEEPLE, [FaceType.MEEPLE]),
  },
})._());

export function renderComponent(id: unknown, vine: Vine): RenderSpec {
  const state$ = $state$.get(vine);
  switch (id) {
    case ComponentType.CARD:
      return renderCustomElement({
        registration: D2,
        inputs: {state: of(state$._('pieces')._('card'))},
        id,
      });
    case ComponentType.COIN:
      return renderCustomElement({
        registration: D2,
        inputs: {state: of(state$._('pieces')._('coin'))},
        id,
      });
    case ComponentType.GEM:
      return renderCustomElement({
        registration: D1,
        inputs: {state: of(state$._('pieces')._('gem'))},
        id,
      });
    case ComponentType.MEEPLE:
      return renderCustomElement({
        registration: D1,
        inputs: {state: of(state$._('pieces')._('meeple'))},
        id,
      });
    default:
      throw new Error(`Unhandled render component ID: ${id}`);
  }
}

export function renderFace(id: unknown): RenderSpec {
  if (!enumType<FaceType>(FaceType).check(id)) {
    throw new Error(`ID ${id} is not a FaceType`);
  }

  return renderCustomElement({
    registration: RENDERED_FACE,
    id: {id},
    inputs: {
      faceType: of(id),
    },
  });
}

export function renderLens(id: unknown): RenderSpec|null {
  if (!enumType<FaceType>(FaceType).check(id)) {
    return null;
  }

  return renderHtml({
    id,
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
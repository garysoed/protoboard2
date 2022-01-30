import {$stateService, source, Vine} from 'grapevine';
import {ImmutableResolver, mutableState} from 'gs-tools/export/state';
import {enumType} from 'gs-types';
import {renderCustomElement, RenderSpec} from 'persona';
import {of} from 'rxjs';

import {D1, D1State, d1State} from '../src-next/piece/d1';
import {slotState, SlotState} from '../src-next/region/slot';

import {FaceType, RENDERED_FACE} from './piece/rendered-face';


export interface DemoState {
  pieces: {
    gem: D1State,
    meeple: D1State,
  },
  d1: {
    gemSlot: SlotState;
    meepleSlot: SlotState;
  };
}

const GEM_ID = Symbol('gem');
const MEEPLE_ID = Symbol('meeple');

export const $state$ = source(vine => $stateService.get(vine).addRoot<DemoState>({
  d1: {
    gemSlot: slotState(
        {},
        {contentIds: mutableState([GEM_ID])},
    ),
    meepleSlot: slotState(
        {},
        {contentIds: mutableState([MEEPLE_ID])},
    ),
  },
  pieces: {
    gem: d1State(GEM_ID, [FaceType.GEM]),
    meeple: d1State(MEEPLE_ID, [FaceType.MEEPLE]),
  },
})._());

export function renderComponent(id: unknown, vine: Vine): RenderSpec {
  const state$ = $state$.get(vine);
  switch (id) {
    case GEM_ID:
      return renderPiece(id, D1, state$._('pieces')._('gem'));
    case MEEPLE_ID:
      return renderPiece(id, D1, state$._('pieces')._('meeple'));
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

function renderPiece(
    id: {},
    registration: typeof D1,
    state$: ImmutableResolver<D1State>,
): RenderSpec {
  return renderCustomElement({
    registration,
    inputs: {state: of(state$)},
    id,
  });
}

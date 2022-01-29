import {$stateService, source, Vine} from 'grapevine';
import {$asArray, $map, $pipe, $zip, countableIterable} from 'gs-tools/export/collect';
import {ImmutableResolver, mutableState} from 'gs-tools/export/state';
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
    gem: d1State(GEM_ID),
    meeple: d1State(MEEPLE_ID),
  },
})._());

export function renderComponent(id: unknown, vine: Vine): RenderSpec {
  const state$ = $state$.get(vine);
  switch (id) {
    case GEM_ID:
      return renderPiece(id, [FaceType.GEM], state$._('pieces')._('gem'));
    case MEEPLE_ID:
      return renderPiece(id, [FaceType.MEEPLE], state$._('pieces')._('meeple'));
    default:
      throw new Error(`Unhandled render component ID: ${id}`);
  }
}

function renderPiece(
    id: {},
    faceTypes: readonly FaceType[],
    state$: ImmutableResolver<D1State>,
): RenderSpec {
  const faces = $pipe(
      faceTypes,
      $zip(countableIterable()),
      $map(([faceType, index]) => renderCustomElement({
        registration: RENDERED_FACE,
        id: {id, index},
        attrs: new Map([['slot', of(`face-${index}`)]]),
        inputs: {
          faceType: of(faceType),
        },
      })),
      $asArray(),
  );

  return renderCustomElement({
    registration: getRegistration(faces.length),
    inputs: {state: of(state$)},
    id,
    children: of(faces),
  });
}

function getRegistration(faceCount: number): typeof D1 {
  switch (faceCount) {
    case 1:
      return D1;
    // case 2:
    //   return $d2;
    // case 6:
    //   return $d6;
    default:
      throw new Error(`Unhandled number of faces: ${faceCount}`);
  }
}
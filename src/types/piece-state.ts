import {intersectType, Type} from 'gs-types';

import {ComponentState, COMPONENT_STATE_TYPE} from './component-state';
import {IsRotatable, IS_ROTATABLE_TYPE} from './is-rotatable';

export interface PieceState extends ComponentState, IsRotatable {
}

export const PIECE_STATE_TYPE: Type<PieceState> = intersectType([
  COMPONENT_STATE_TYPE,
  IS_ROTATABLE_TYPE,
]);
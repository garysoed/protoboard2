import {mutableState, MutableState} from 'gs-tools/export/state';

import {ComponentId} from '../id/component-id';
import {StampId} from '../id/stamp-id';
import {ComponentState} from '../types/component-state';

export interface StampState {
  readonly x: number;
  readonly y: number;
  readonly stampId: StampId<unknown>;
}

export interface PadState extends ComponentState {
  readonly stamps: MutableState<readonly StampState[]>;
}

export function padState(id: ComponentId<unknown>, partial: Partial<PadState> = {}): PadState {
  return {
    id,
    stamps: mutableState([]),
    ...partial,
  };
}
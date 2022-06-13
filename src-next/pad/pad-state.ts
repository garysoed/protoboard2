import {MutableState} from 'gs-tools/export/state';

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
import {mutableState, MutableState} from 'gs-tools/export/state';

import {ComponentId} from '../id/component-id';
import {StampId} from '../id/stamp-id';
import {ComponentState} from '../types/component-state';

export enum PadContentType {
  STAMP,
}

export interface StampState {
  readonly type: PadContentType.STAMP;
  readonly x: number;
  readonly y: number;
  readonly stampId: StampId<unknown>;
}

export type PadContentState = StampState;

export interface PadState extends ComponentState {
  readonly contents: MutableState<readonly PadContentState[]>;
}

export function padState(id: ComponentId<unknown>, partial: Partial<PadState> = {}): PadState {
  return {
    id,
    contents: mutableState([]),
    ...partial,
  };
}
import {mutableState, MutableState} from 'gs-tools/export/state';

import {ComponentId} from '../id/component-id';
import {LineId} from '../id/line-id';
import {StampId} from '../id/stamp-id';
import {ComponentState} from '../types/component-state';

export enum PadContentType {
  LINE,
  STAMP,
}

export interface LineState {
  readonly type: PadContentType.LINE;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly lineId: LineId<unknown>;
}

export interface StampState {
  readonly type: PadContentType.STAMP;
  readonly x: number;
  readonly y: number;
  readonly stampId: StampId<unknown>;
}

export type PadContentState = LineState|StampState;

interface HalfLineState {
  readonly x1: number;
  readonly y1: number;
  readonly lineId: LineId<unknown>;
}

export interface PadState extends ComponentState {
  readonly contents: MutableState<readonly PadContentState[]>;
  readonly halfLine: MutableState<HalfLineState|null>;
}

export function padState(id: ComponentId<unknown>, partial: Partial<PadState> = {}): PadState {
  return {
    id,
    contents: mutableState([]),
    halfLine: mutableState(null),
    ...partial,
  };
}
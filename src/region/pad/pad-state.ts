import {hasPropertiesType, instanceofType, intersectType, Type} from 'gs-types';
import {BehaviorSubject, Subject} from 'rxjs';

import {ComponentId} from '../../id/component-id';
import {ComponentState, COMPONENT_STATE_TYPE} from '../../types/component-state';

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
  readonly lineId: string;
}

export interface StampState {
  readonly type: PadContentType.STAMP;
  readonly x: number;
  readonly y: number;
  readonly stampId: string;
}

export type PadContentState = LineState|StampState;

export interface HalfLineState {
  readonly x1: number;
  readonly y1: number;
  readonly lineId: string;
}

export interface PadState extends ComponentState {
  readonly contents: Subject<readonly PadContentState[]>;
  readonly halfLine: Subject<HalfLineState|null>;
}

export const PAD_STATE_TYPE: Type<PadState> = intersectType([
  hasPropertiesType({
    contents: instanceofType<Subject<readonly PadContentState[]>>(Subject),
    halfLine: instanceofType<Subject<HalfLineState|null>>(Subject),
  }),
  COMPONENT_STATE_TYPE,
]);

export function padState(id: ComponentId, partial: Partial<PadState> = {}): PadState {
  return {
    id,
    contents: new BehaviorSubject<readonly PadContentState[]>([]),
    halfLine: new BehaviorSubject<HalfLineState|null>(null),
    ...partial,
  };
}
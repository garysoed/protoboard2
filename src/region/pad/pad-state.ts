import {hasPropertiesType, instanceofType, intersectType, Type} from 'gs-types';
import {BehaviorSubject, Subject} from 'rxjs';

import {componentId} from '../../id/component-id';
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

export function lineState(partial: Partial<LineState> = {}): LineState {
  return {
    type: PadContentType.LINE,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    lineId: '',
    ...partial,
  };
}

export interface StampState {
  readonly type: PadContentType.STAMP;
  readonly x: number;
  readonly y: number;
  readonly stampId: string;
}

export function stampState(partial: Partial<StampState> = {}): StampState {
  return {
    type: PadContentType.STAMP,
    x: 0,
    y: 0,
    stampId: '',
    ...partial,
  };
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

interface PadStateInput extends Partial<PadState> {
  readonly label?: string;
}

export function padState(partial: PadStateInput): PadState {
  return {
    id: componentId(partial.label),
    contents: new BehaviorSubject<readonly PadContentState[]>([]),
    halfLine: new BehaviorSubject<HalfLineState|null>(null),
    ...partial,
  };
}
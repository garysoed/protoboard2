import {MutableState} from 'gs-tools/export/state';

export interface CanvasLine {
  readonly fromX: number;
  readonly fromY: number;
  readonly toX: number;
  readonly toY: number;
  readonly configName: string;
}

export interface CanvasHalfLine {
  readonly fromX: number;
  readonly fromY: number;
  readonly configName: string;
}

export interface CanvasIcon {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly configName: string;
}


export interface CanvasSpec {
  readonly icons: MutableState<readonly CanvasIcon[]>;
  readonly lines: MutableState<readonly CanvasLine[]>;
  readonly halfLine: MutableState<CanvasHalfLine|null>;
}

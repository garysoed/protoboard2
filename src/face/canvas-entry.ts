import {StateId} from 'gs-tools/export/state';

export interface CanvasLine {
  readonly fromX: number;
  readonly fromY: number;
  readonly toX: number;
  readonly toY: number;
  readonly configName: string;
}

export interface CanvasIcon {
  readonly x: number;
  readonly y: number;
  readonly configName: string;
}


export interface CanvasEntry {
  readonly icons: StateId<readonly CanvasIcon[]>;
  readonly lines: StateId<readonly CanvasLine[]>;
}

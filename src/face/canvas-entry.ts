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
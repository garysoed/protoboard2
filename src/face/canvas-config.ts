export interface LineConfig {
  readonly type: 'line';
  readonly color: string;
  readonly dashArray?: readonly string[];
  readonly dashOffset?: string;
  readonly linecap?: 'butt'|'round'|'square';
  readonly width?: string;
}

export interface IconConfig {
  readonly type: 'icon';
  readonly svgName: string;
}

export type CanvasConfig = IconConfig|LineConfig;
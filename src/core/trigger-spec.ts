export enum TriggerType {
  CLICK,
  KEY,
}

export enum TriggerKey {
  A = 'a',
  B = 'b',
  C = 'c',
  D = 'd',
  E = 'e',
  F = 'f',
  G = 'g',
  H = 'h',
  I = 'i',
  J = 'j',
  K = 'k',
  L = 'l',
  M = 'm',
  N = 'n',
  O = 'o',
  P = 'p',
  Q = 'q',
  R = 'r',
  S = 's',
  T = 't',
  U = 'u',
  V = 'v',
  W = 'w',
  X = 'x',
  Y = 'y',
  Z = 'z',
  QUESTION = '?',
}

interface KeySpec {
  readonly key: TriggerKey;
  readonly type: TriggerType.KEY;
}

interface SimpleSpec {
  readonly type: TriggerType.CLICK;
}

export type TriggerSpec = KeySpec|SimpleSpec;

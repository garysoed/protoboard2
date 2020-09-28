
export enum TriggerType {
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
  CLICK = 'click',
}

type ReservedTriggerKey = TriggerType.QUESTION;
type UnreservedTriggerKey = Exclude<TriggerType, ReservedTriggerKey>;

export interface DetailedTriggerSpec<T> {
  readonly type: T;
  readonly alt?: boolean;
  readonly ctrl?: boolean;
  readonly meta?: boolean;
  readonly shift?: boolean;
}

export type UnreservedTriggerSpec =
    UnreservedTriggerKey|DetailedTriggerSpec<UnreservedTriggerKey>;
export type TriggerSpec = TriggerType|DetailedTriggerSpec<TriggerType>;

export function isKeyTrigger(triggerType: TriggerType): boolean {
  return triggerType !== TriggerType.CLICK;
}

export enum TriggerType {
  CLICK,
  KEY,
}

interface KeySpec {
  readonly key: 'a'|'b'|'c'|'d'|'e'|'f'|'g'|'h'|'i'|'j'|'k'|'l'|'m'|'n'|'o'|'p'|'q'|'r'|'s'|'t'|'u'|
      'v'|'w'|'x'|'y'|'z';
  readonly type: TriggerType.KEY;
}

interface SimpleSpec {
  readonly type: TriggerType.CLICK;
}

export type TriggerSpec = KeySpec|SimpleSpec;

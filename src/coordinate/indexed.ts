export interface Indexed {
  readonly type: 'indexed';
  readonly index: number;
}

export function createIndexed(index: number): Indexed {
  return {type: 'indexed', index};
}

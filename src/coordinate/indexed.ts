export interface Indexed {
  readonly index: number;
}

export function createIndexed(index: number): Indexed {
  return {index};
}

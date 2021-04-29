import {Tile} from '../types';

export interface TestTile extends Tile {
  readonly payload: string;
}

export function testTile(x: number, y: number): TestTile {
  return {x, y, payload: `${x},${y}`};
}
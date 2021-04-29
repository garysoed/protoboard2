import {getAllValues} from 'gs-tools/export/typescript';

import {Cartesian} from '../coordinate/cartesian';

import {BaseBoard} from './base-board';
import {Board, Tile} from './types';


export enum Direction {
  UP = 'u',
  RIGHT = 'r',
  DOWN = 'd',
  LEFT = 'l',
}

export type RectOrthogonal<TILE extends Tile> = Board<TILE, Direction>;

export function rectOrthogonal<TILE extends Tile>(tiles: Iterable<TILE>): RectOrthogonal<TILE> {
  return new BaseBoard(
      tiles,
      getAllValues<Direction>(Direction),
      getDeltaCoordinate,
  );
}

function getDeltaCoordinate(direction: Direction): Cartesian {
  switch (direction) {
    case Direction.UP:
      return {x: 0, y: -1};
    case Direction.DOWN:
      return {x: 0, y: 1};
    case Direction.LEFT:
      return {x: -1, y: 0};
    case Direction.RIGHT:
      return {x: 1, y: 0};
  }
}

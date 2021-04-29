import {getAllValues} from 'gs-tools/export/typescript';

import {Cartesian} from '../coordinate/cartesian';

import {BaseBoard} from './base-board';
import {Board, Tile} from './types';


export enum Direction {
  UP_RIGHT = 'ur',
  RIGHT = 'r',
  DOWN_RIGHT = 'dr',
  DOWN_LEFT = 'dl',
  LEFT = 'l',
  UP_LEFT = 'ul',
}


export type VHex<TILE extends Tile> = Board<TILE, Direction>;

export function vhex<TILE extends Tile>(tiles: Iterable<TILE>): VHex<TILE> {
  return new BaseBoard(
      tiles,
      getAllValues<Direction>(Direction),
      getDeltaCoordinate,
  );
}

function getDeltaCoordinate(direction: Direction): Cartesian {
  switch (direction) {
    case Direction.UP_RIGHT:
      return {x: 0, y: -1};
    case Direction.RIGHT:
      return {x: 1, y: 0};
    case Direction.DOWN_RIGHT:
      return {x: 1, y: 1};
    case Direction.DOWN_LEFT:
      return {x: 0, y: 1};
    case Direction.LEFT:
      return {x: -1, y: 0};
    case Direction.UP_LEFT:
      return {x: -1, y: -1};
  }
}

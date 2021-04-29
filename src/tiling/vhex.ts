import {$asMap, $filterNonNull, $map, $pipe} from 'gs-tools/export/collect';
import {cache} from 'gs-tools/export/data';
import {getAllValues} from 'gs-tools/export/typescript';

import {Cartesian} from '../coordinate/cartesian';

import {Board, Tile, TileGrid} from './types';


export enum Direction {
  UP_RIGHT = 'ur',
  RIGHT = 'r',
  DOWN_RIGHT = 'dr',
  DOWN_LEFT = 'dl',
  LEFT = 'l',
  UP_LEFT = 'ul',
}


export class VHex<TILE extends Tile> implements Board<TILE, Direction> {
  constructor(private readonly inputTiles: Iterable<TILE>) {}

  getAdjacentTilesAt(coordinate: Cartesian): ReadonlyMap<Direction, TILE> {
    return $pipe(
        getAllValues<Direction>(Direction),
        $map(direction => {
          const tile = this.getTileFrom(coordinate, direction);
          if (!tile) {
            return null;
          }

          return [direction, tile] as const;
        }),
        $filterNonNull(),
        $asMap(),
    );
  }

  getTileAt({x, y}: Cartesian): TILE|null {
    return this.tileGrid[y]?.[x] ?? null;
  }

  getTileFrom(origin: Cartesian, direction: Direction): TILE|null {
    const newCoordinate = computeNewCoordinate(origin, direction);
    return this.getTileAt(newCoordinate);
  }

  @cache()
  private get tileGrid(): TileGrid<TILE> {
    const rows: TILE[][] = [];
    for (const tile of this.inputTiles) {
      const cells = rows[tile.y] ?? [];
      cells[tile.x] = tile;
      rows[tile.y] = cells;
    }

    return rows;
  }
}

function computeNewCoordinate(from: Cartesian, direction: Direction): Cartesian {
  switch (direction) {
    case Direction.UP_RIGHT:
      return {x: from.x, y: from.y - 1};
    case Direction.RIGHT:
      return {x: from.x + 1, y: from.y};
    case Direction.DOWN_RIGHT:
      return {x: from.x + 1, y: from.y + 1};
    case Direction.DOWN_LEFT:
      return {x: from.x, y: from.y + 1};
    case Direction.LEFT:
      return {x: from.x - 1, y: from.y};
    case Direction.UP_LEFT:
      return {x: from.x - 1, y: from.y - 1};
  }
}

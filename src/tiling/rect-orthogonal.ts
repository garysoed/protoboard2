import {$asMap, $filterNonNull, $map, $pipe} from 'gs-tools/export/collect';
import {cache} from 'gs-tools/export/data';
import {getAllValues} from 'gs-tools/export/typescript';

import {Cartesian} from '../coordinate/cartesian';

import {Board, Tile, TileGrid} from './types';


export enum Direction {
  UP = 'u',
  RIGHT = 'r',
  DOWN = 'd',
  LEFT = 'l',
}


export class RectOrthogonal<TILE extends Tile> implements Board<TILE, Direction> {
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
    case Direction.UP:
      return {x: from.x, y: from.y - 1};
    case Direction.DOWN:
      return {x: from.x, y: from.y + 1};
    case Direction.LEFT:
      return {x: from.x - 1, y: from.y};
    case Direction.RIGHT:
      return {x: from.x + 1, y: from.y};
  }
}

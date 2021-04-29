import {$asMap, $filterNonNull, $map, $pipe} from 'gs-tools/export/collect';
import {cache} from 'gs-tools/export/data';

import {Cartesian} from '../coordinate/cartesian';

import {Board, Tile, TileGrid} from './types';

type GetDeltaCoordinate<DIRECTION> = (direction: DIRECTION) => Cartesian;

export class BaseBoard<TILE extends Tile, DIRECTION> implements Board<TILE, DIRECTION> {
  constructor(
      private readonly inputTiles: Iterable<TILE>,
      private readonly directions: Iterable<DIRECTION>,
      private readonly getDeltaCoordinate: GetDeltaCoordinate<DIRECTION>,
  ) {}

  getAdjacentTilesAt(coordinate: Cartesian): ReadonlyMap<DIRECTION, TILE> {
    return $pipe(
        this.directions,
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

  getTileFrom(origin: Cartesian, direction: DIRECTION): TILE|null {
    const deltaCoordinate = this.getDeltaCoordinate(direction);
    const newCoordinate = {x: origin.x + deltaCoordinate.x, y: origin.y + deltaCoordinate.y};
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
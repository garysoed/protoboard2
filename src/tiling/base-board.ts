import {$asMap, $asSet, $filter, $filterNonNull, $map, $pipe} from 'gs-tools/export/collect';
import {cache} from 'gs-tools/export/data';

import {Cartesian} from '../coordinate/cartesian';

import {Board, Tile} from './types';


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

  getTileAt(coordinate: Cartesian): TILE|null {
    return this.tileMap.get(getKey(coordinate)) ?? null;
  }

  getTileFrom(origin: Cartesian, direction: DIRECTION): TILE|null {
    const deltaCoordinate = this.getDeltaCoordinate(direction);
    const newCoordinate = {x: origin.x + deltaCoordinate.x, y: origin.y + deltaCoordinate.y};
    return this.getTileAt(newCoordinate);
  }

  removeTiles(toRemoveTiles: Iterable<Cartesian>): BaseBoard<TILE, DIRECTION> {
    const coordinates = $pipe(
        toRemoveTiles,
        $map(tile => getKey(tile)),
        $asSet(),
    );

    return new BaseBoard(
        $pipe(
            this.tiles,
            $filter(tile => !coordinates.has(getKey(tile))),
            $asSet(),
        ),
        this.directions,
        this.getDeltaCoordinate,
    );
  }

  replaceTiles(newTiles: Iterable<TILE>): BaseBoard<TILE, DIRECTION> {
    return new BaseBoard(
        [...this.inputTiles, ...newTiles],
        this.directions,
        this.getDeltaCoordinate,
    );
  }

  @cache()
  get tiles(): ReadonlySet<TILE> {
    return $pipe(
        this.inputTiles,
        $filter(tile => !!this.tileMap.get(getKey(tile))),
        $asSet(),
    );
  }

  @cache()
  private get tileMap(): ReadonlyMap<string, TILE> {
    return $pipe(
        this.inputTiles,
        $map(tile => [getKey(tile), tile] as const),
        $asMap(),
    );
  }
}

function getKey(coordinate: Cartesian): string {
  return `${coordinate.x},${coordinate.y}`;
}
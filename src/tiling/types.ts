import {Cartesian} from '../coordinate/cartesian';

export type Tile = Cartesian;

export interface Board<TILE extends Tile, DIRECTION> {
  readonly tiles: ReadonlySet<TILE>;

  getAdjacentTilesAt(coordinate: Cartesian): ReadonlyMap<DIRECTION, TILE>;

  getTileAt(coordinate: Cartesian): TILE|null;

  getTileFrom(origin: Cartesian, direction: DIRECTION): TILE|null;

  removeTiles(tiles: Iterable<Cartesian>): Board<TILE, DIRECTION>;

  replaceTiles(newTiles: Iterable<TILE>): Board<TILE, DIRECTION>;
}

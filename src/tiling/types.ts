import {Cartesian} from '../coordinate/cartesian';

export type Tile = Cartesian;

export type TileGrid<TILE extends Tile> = ReadonlyArray<readonly TILE[]>;

export interface Board<TILE extends Tile, DIRECTION> {
  getAdjacentTilesAt(coordinate: Cartesian): ReadonlyMap<DIRECTION, TILE>;

  getTileAt(coordinate: Cartesian): TILE|null;

  getTileFrom(origin: Cartesian, direction: DIRECTION): TILE|null;
}

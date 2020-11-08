import {StateId} from 'gs-tools/export/state';
import {getAllValues} from 'gs-tools/export/typescript';

export enum GridArea {
  SMALL1 = 'small1',
  SMALL2 = 'small2',
  SMALL3 = 'small3',
  SMALL4 = 'small4',
  SMALL5 = 'small5',
  SMALL6 = 'small6',
  SIDE = 'side',
  LARGE = 'large',
}
export const GRID_AREAS = getAllValues<GridArea>(GridArea);

export interface RegionState {
  readonly $targetArea: StateId<number>;
}

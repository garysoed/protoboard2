import { source } from 'grapevine';
import { $window } from 'mask';
import { fromPattern, LocationService } from 'persona';

export enum Views {
//   D1 = 'd1',
//   D2 = 'd2',
//   DECK = 'de',
//   FREE_LAYOUT = 'fl',
//   GRID_LAYOUT = 'gl',
  INSTRUCTION = 'in',
//   SLOT = 'sl',
}

const ROUTE_SPEC = {
  [Views.INSTRUCTION]: fromPattern('/', {}),
  // [Views.FREE_LAYOUT]: fromPattern('/freelayout', {}),
  // [Views.GRID_LAYOUT]: fromPattern('/gridlayout', {}),
  // [Views.D1]: fromPattern('/d1', {}),
  // [Views.D2]: fromPattern('/d2', {}),
  // [Views.DECK]: fromPattern('/deck', {}),
  // [Views.SLOT]: fromPattern('/slot', {}),
};

const DEFAULT_ROUTE = {payload: {}, type: Views.INSTRUCTION};

export const $locationService = source(
    vine => new LocationService(ROUTE_SPEC, DEFAULT_ROUTE, $window.get(vine)),
);

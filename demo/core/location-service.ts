import { source } from 'grapevine';
import { $window } from 'mask';
import { fromPattern, LocationService } from 'persona';

export enum Views {
  D1 = 'd1',
  D2 = 'd2',
  D6 = 'd6',
//   DECK = 'de',
//   FREE_LAYOUT = 'fl',
//   GRID_LAYOUT = 'gl',
  INSTRUCTION = 'in',
}

const ROUTE_SPEC = {
  [Views.INSTRUCTION]: fromPattern('/', {}),
  // [Views.FREE_LAYOUT]: fromPattern('/freelayout', {}),
  // [Views.GRID_LAYOUT]: fromPattern('/gridlayout', {}),
  [Views.D1]: fromPattern('/d1', {}),
  [Views.D2]: fromPattern('/d2', {}),
  [Views.D6]: fromPattern('/d6', {}),
  // [Views.DECK]: fromPattern('/deck', {}),
};

const DEFAULT_ROUTE = {payload: {}, type: Views.INSTRUCTION};

export const $locationService = source(
    'LocationService',
    vine => new LocationService(ROUTE_SPEC, DEFAULT_ROUTE, $window.get(vine)),
);

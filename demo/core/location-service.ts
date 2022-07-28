import {source} from 'grapevine';
import {$window} from 'mask';
import {fromPattern, LocationService} from 'persona';

export enum Views {
  D1 = 'd1',
  D2 = 'd2',
  D6 = 'd6',
  DECK = 'de',
  INSTRUCTION = 'in',
  PAD = 'pa',
  SURFACE = 'su',
}

const ROUTE_SPEC = {
  [Views.INSTRUCTION]: fromPattern('/', {}),
  [Views.D1]: fromPattern('/d1', {}),
  [Views.D2]: fromPattern('/d2', {}),
  [Views.D6]: fromPattern('/d6', {}),
  [Views.DECK]: fromPattern('/deck', {}),
  [Views.PAD]: fromPattern('/pad', {}),
  [Views.SURFACE]: fromPattern('/surface', {}),
};

const DEFAULT_ROUTE = {payload: {}, type: Views.INSTRUCTION};

export const $locationService = source(
    vine => new LocationService(ROUTE_SPEC, DEFAULT_ROUTE, $window.get(vine)),
);

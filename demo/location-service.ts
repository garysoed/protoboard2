import { source } from 'grapevine';
import { $window } from 'mask';
import { fromPattern, LocationService, Route } from 'persona';
import { BehaviorSubject } from 'rxjs';

export enum Views {
  D1 = 'd1',
  FREE_LAYOUT = 'fl',
  GRID_LAYOUT = 'gl',
  INSTRUCTION = 'in',
  SLOT = 'sl',
}

const ROUTE_SPEC = {
  [Views.INSTRUCTION]: fromPattern('/', {}),
  [Views.FREE_LAYOUT]: fromPattern('/freelayout', {}),
  [Views.GRID_LAYOUT]: fromPattern('/gridlayout', {}),
  [Views.D1]: fromPattern('/d1', {}),
  [Views.SLOT]: fromPattern('/slot', {}),
};

const DEFAULT_ROUTE = {payload: {}, type: Views.INSTRUCTION};

export const $locationService = source(
    vine => new BehaviorSubject(
        new LocationService(ROUTE_SPEC, DEFAULT_ROUTE, $window.get(vine)),
    ),
    globalThis,
);

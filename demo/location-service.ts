import { $window, _v } from '@mask';
import { LocationService, LocationSpec, Route, RouteSpec } from '@persona';
import { BehaviorSubject } from 'rxjs';

export interface Routes extends LocationSpec {
  'FREE_LAYOUT': {};
  'GRID_LAYOUT': {};
  'INSTRUCTION': {};
  'PIECE': {};
}

const ROUTE_SPEC: Array<RouteSpec<keyof Routes>> = [
  {path: '/', type: 'INSTRUCTION'},
  {path: '/freelayout', type: 'FREE_LAYOUT'},
  {path: '/gridlayout', type: 'GRID_LAYOUT'},
  {path: '/piece', type: 'PIECE'},
];

const DEFAULT_ROUTE: Route<Routes, 'INSTRUCTION'> = {payload: {}, type: 'INSTRUCTION'};

export const $locationService = _v.source(
    vine => new BehaviorSubject(
        new LocationService<Routes>(ROUTE_SPEC, DEFAULT_ROUTE, $window.get(vine)),
    ),
    globalThis,
);

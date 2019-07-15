import { $window, _v } from '@mask';
import { LocationService, LocationSpec, Route, RouteSpec } from '@persona';
import { BehaviorSubject } from 'rxjs';

export interface Routes extends LocationSpec {
  'INSTRUCTION': {};
  'LAYOUT_FREE': {};
  'PIECE': {};
}

const ROUTE_SPEC: Array<RouteSpec<keyof Routes>> = [
  {path: '/', type: 'INSTRUCTION'},
  {path: '/layoutfree', type: 'LAYOUT_FREE'},
  {path: '/piece', type: 'PIECE'},
];

const DEFAULT_ROUTE: Route<Routes, 'INSTRUCTION'> = {payload: {}, type: 'INSTRUCTION'};

export const $locationService = _v.source(
    vine => new BehaviorSubject(
        new LocationService<Routes>(ROUTE_SPEC, DEFAULT_ROUTE, $window.get(vine)),
    ),
    globalThis,
);

import { $window, _v } from '@mask';
import { LocationService, LocationSpec, Route, RouteSpec } from '@persona';
import { map } from '@rxjs/operators';

export interface Routes extends LocationSpec {
  'INSTRUCTION': {};
}

const ROUTE_SPEC: Array<RouteSpec<keyof Routes>> = [
  {path: '/', type: 'INSTRUCTION'},
];

const DEFAULT_ROUTE: Route<Routes, 'INSTRUCTION'> = {payload: {}, type: 'INSTRUCTION'};

export const $locationService = _v.stream(
    vine => $window.get(vine)
        .pipe(
            map(windowObj => new LocationService<Routes>(ROUTE_SPEC, DEFAULT_ROUTE, windowObj)),
        ),
    globalThis,
);

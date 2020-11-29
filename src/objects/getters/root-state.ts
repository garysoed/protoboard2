import {stream} from 'grapevine';
import {$asArray, $asMap, $asSet, $filter, $map, $pipe} from 'gs-tools/export/collect';
import {StateId} from 'gs-tools/export/state';
import {$stateService} from 'mask';
import {combineLatest, of as observableOf} from 'rxjs';
import {map, switchMap, withLatestFrom} from 'rxjs/operators';

import {CoordinateTypes, IsContainer} from '../../payload/is-container';
import {ActiveSpec} from '../../types/active-spec';
import {ObjectSpec} from '../../types/object-spec';
import {$$rootState} from '../root-state';


export const $rootState = stream(
    'rootState',
    vine => {
      return combineLatest([
        $$rootState.get(vine),
        $stateService.get(vine),
      ])
          .pipe(
              switchMap(([$rootState, stateService]) => {
                if (!$rootState) {
                  return observableOf(null);
                }

                return stateService.get($rootState);
              }));
    },
);

export const $activeState = stream<ActiveSpec|null>(
    'activeState',
    vine => $rootState.get(vine).pipe(
        withLatestFrom($stateService.get(vine)),
        switchMap(([rootState, stateService]) => {
          if (!rootState) {
            return observableOf(null);
          }

          return stateService.get(rootState.$activeId);
        }),
    ),
);

type GetContainerOf = (id: StateId<ObjectSpec<any>>) =>
    StateId<ObjectSpec<IsContainer<CoordinateTypes>>>|null;
export const $getContainerOf = stream<GetContainerOf>(
    'getContainerOf',
    vine => combineLatest([
      $rootState.get(vine),
      $stateService.get(vine),
    ])
        .pipe(
            // Map of container ID to content IDs.
            switchMap(([rootState, stateService]) => {
              const contentEntries = $pipe(
                  rootState?.containerIds ?? [],
                  $map(containerSpecId => {
                    return stateService.get(containerSpecId).pipe(
                        switchMap(containerSpec => {
                          if (!containerSpec) {
                            return observableOf(null);
                          }

                          return stateService.get(containerSpec.payload.$contentSpecs);
                        }),
                        map(contentSpecs => {
                          if (!contentSpecs) {
                            return new Set<string>();
                          }

                          return $pipe(
                              contentSpecs,
                              $map(contentSpec => contentSpec.objectId.id),
                              $asSet(),
                          );
                        }),
                        map(contentSet => [containerSpecId, contentSet] as const),
                    );
                  }),
                  $asArray(),
              );

              if (contentEntries.length <= 0) {
                return observableOf(
                    new Map<StateId<ObjectSpec<any>>, ReadonlySet<string>>(),
                );
              }

              return combineLatest(contentEntries).pipe(
                  map(entries => new Map<StateId<ObjectSpec<any>>, ReadonlySet<string>>(entries)),
              );
            }),
            map(containerMap => {
              return (id: StateId<ObjectSpec<any>>) => {
                const entry = [...containerMap].find(([, contentSet]) => {
                  return contentSet.has(id.id);
                });
                return entry?.[0] ?? null;
              };
            }),
        ),
);

type GetObjectSpec = <P>(id: StateId<ObjectSpec<P>>) => ObjectSpec<P>|null;
export const $getObjectSpec = stream<GetObjectSpec>(
    'getObjectSpec',
    vine => $objectSpecMap.get(vine).pipe(
        map(objectSpecMap => {
          return <P>(id: StateId<ObjectSpec<P>>) => {
            for (const [specId, spec] of objectSpecMap) {
              if (specId === id.id) {
                return spec;
              }
            }
            return null;
          };
        }),
    ),
);

export const $objectSpecIds = stream<ReadonlySet<StateId<ObjectSpec<any>>>>(
    'objectSpecIds',
    vine => $rootState.get(vine).pipe(
        map(rootState => {
          if (!rootState) {
            return [];
          }

          return rootState.objectSpecIds;
        }),
        map(ids => new Set(ids)),
    ),
);

const $objectSpecMap = stream<ReadonlyMap<string, ObjectSpec<any>>>(
    'objectSpecMap',
    vine => $rootState.get(vine).pipe(
        withLatestFrom($stateService.get(vine)),
        switchMap(([rootState, stateService]) => {
          if (!rootState) {
            return observableOf(new Map<string, ObjectSpec<any>>());
          }

          const objectSpecEntries$List = $pipe(
              rootState.objectSpecIds,
              $map(id => {
                return stateService.get(id).pipe(map(state => [id.id, state] as const));
              }),
              $asArray(),
          );

          return combineLatest(objectSpecEntries$List).pipe(
              map(entries => $pipe(
                  entries,
                  $filter((entry): entry is [string, ObjectSpec<any>] => {
                    return !!entry[1];
                  }),
                  $asMap(),
              )),
          );
        }),
    ),
);

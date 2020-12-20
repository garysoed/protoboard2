import {stream} from 'grapevine';
import {$asArray, $asMap, $asSet, $filter, $find, $map, $pipe} from 'gs-tools/export/collect';
import {StateId} from 'gs-tools/export/state';
import {$stateService} from 'mask';
import {combineLatest, of as observableOf, Observable} from 'rxjs';
import {map, switchMap, withLatestFrom} from 'rxjs/operators';

import {CoordinateTypes} from '../../payload/is-container';
import {ActiveSpec} from '../../types/active-spec';
import {ContainerSpec} from '../../types/container-spec';
import {ObjectClass, ObjectSpec} from '../../types/object-spec';
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

export const $activeId = stream<StateId<ActiveSpec>|null>(
    'activeState',
    vine => $objectSpecMap.get(vine).pipe(
        map(objectSpecMap => {
          return $pipe(
              objectSpecMap,
              $find((pair): pair is [StateId<ActiveSpec>, ActiveSpec] => {
                return pair[1].objectClass === ObjectClass.ACTIVE;
              }),
          )?.[0] ?? null;
        }),
    ),
);

// TODO: Rename to $activeSpec
export const $activeState = stream<ActiveSpec|null>(
    'activeState',
    vine => combineLatest([$activeId.get(vine), $getObjectSpec.get(vine)]).pipe(
        switchMap(([activeId, getObjectSpec]) => {
          return activeId ? getObjectSpec(activeId) : observableOf(null);
        }),
    ),
);

type GetContainerOf = (id: StateId<ObjectSpec<any>>) =>
    StateId<ContainerSpec<unknown, CoordinateTypes>>|null;
export const $getContainerOf = stream<GetContainerOf>(
    'getContainerOf',
    vine => combineLatest([
      $stateService.get(vine),
      $objectSpecMap.get(vine),
    ])
        .pipe(
            // Map of container ID to content IDs.
            switchMap(([stateService, objectSpecMap]) => {
              const contentEntries = $pipe(
                  objectSpecMap,
                  $filter((pair): pair is [StateId<ContainerSpec<unknown, CoordinateTypes>>, ContainerSpec<unknown, CoordinateTypes>] => {
                    return pair[1].objectClass === ObjectClass.CONTAINER;
                  }),
                  $map(([containerSpecId]) => {
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
                    new Map<StateId<ContainerSpec<unknown, CoordinateTypes>>, ReadonlySet<string>>(),
                );
              }

              return combineLatest(contentEntries).pipe(
                  map(entries => new Map<StateId<ContainerSpec<unknown, CoordinateTypes>>, ReadonlySet<string>>(entries)),
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

type GetObjectSpec = <O extends ObjectSpec<any>>(id: StateId<O>) => Observable<O|null>;
export const $getObjectSpec = stream<GetObjectSpec>(
    'getObjectSpec',
    vine => $stateService.get(vine).pipe(
        map(stateService => {
          return <O extends ObjectSpec<any>>(id: StateId<O>) => stateService.get(id);
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

const $objectSpecMap = stream<ReadonlyMap<StateId<ObjectSpec<any>>, ObjectSpec<any>>>(
    'objectSpecMap',
    vine => $rootState.get(vine).pipe(
        withLatestFrom($stateService.get(vine)),
        switchMap(([rootState, stateService]) => {
          if (!rootState) {
            return observableOf(new Map<StateId<ObjectSpec<any>>, ObjectSpec<any>>());
          }

          const objectSpecEntries$List = $pipe(
              rootState.objectSpecIds,
              $map(id => {
                return stateService.get(id).pipe(map(state => [id, state] as const));
              }),
              $asArray(),
          );

          if (objectSpecEntries$List.length <= 0) {
            return observableOf(new Map<StateId<ObjectSpec<any>>, ObjectSpec<any>>());
          }

          return combineLatest(objectSpecEntries$List).pipe(
              map(entries => $pipe(
                  entries,
                  $filter((entry): entry is [StateId<ObjectSpec<any>>, ObjectSpec<any>] => {
                    return !!entry[1];
                  }),
                  $asMap(),
              )),
          );
        }),
    ),
);

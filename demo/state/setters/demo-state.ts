import {source, Vine} from 'grapevine';
import {$asArray, $filterDefined, $map, $pipe} from 'gs-tools/export/collect';
import {StateId, StateService} from 'gs-tools/export/state';
import {$stateService} from 'mask';
import {combineLatest, of as observableOf} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {createIndexed} from '../../../src/coordinate/indexed';
import {activeSpec, ActiveSpec} from '../../../src/core/active';
import {$getObjectSpec} from '../../../src/objects/getters/root-state';
import {$$rootState} from '../../../src/objects/root-state';
import {ContentSpec} from '../../../src/payload/is-container';
import {slotSpec, SlotSpec} from '../../../src/region/slot';
import {ObjectClass, ObjectSpec} from '../../../src/types/object-spec';
import {PIECE_TYPE, REGION_TYPE, SUPPLY_TYPE} from '../../core/object-specs';
import {$demoState} from '../getters/demo-state';
import {$objectSpecIds} from '../getters/play-state';
import {$pieceSpecs, $regionSpecs} from '../getters/staging-state';
import {DemoState} from '../types/demo-state';
import {PiecePayload} from '../types/piece-payload';
import {PieceSpec} from '../types/piece-spec';
import {PlayState} from '../types/play-state';
import {RegionPayload} from '../types/region-payload';
import {RegionSpec} from '../types/region-spec';


export const $setStaging = source(
    'setStaging',
    vine => {
      const stateService = $stateService.get(vine);
      return combineLatest([
        $demoState.get(vine),
        $objectSpecIds.get(vine),
        $pieceSpecs.get(vine),
        $regionSpecs.get(vine),
      ])
          .pipe(
              switchMap(([demoState, objectSpecIds, pieceSpecs, regionSpecs]) => {
                if (!demoState) {
                  return observableOf(null);
                }

                const objectSpecs = $pipe(
                    objectSpecIds,
                    $map(id => $getObjectSpec.get(vine)(id)),
                    $asArray(),
                );

                if (objectSpecs.length <= 0) {
                  return observableOf({
                    objectSpecs: [],
                    demoState,
                    pieceSpecs,
                    regionSpecs,
                    stateService,
                  });
                }

                return combineLatest(objectSpecs).pipe(map(objectSpecs => ({
                  objectSpecs,
                  demoState,
                  pieceSpecs,
                  regionSpecs,
                  stateService,
                })));
              }),
              map(params => {
                if (!params) {
                  return null;
                }

                const {demoState, objectSpecs, pieceSpecs, regionSpecs, stateService} = params;
                return (isStaging: boolean) => {
                  if (isStaging) {
                    setToStaging(
                        demoState,
                        $pipe(objectSpecs, $filterDefined(), $asArray()),
                        stateService,
                    );
                  } else {
                    setToPlay(demoState, pieceSpecs ?? [], regionSpecs ?? [], stateService, vine);
                  }
                };
              }),
          );
    },
);

function setToStaging(
    demoState: DemoState,
    objectSpecs: ReadonlyArray<ObjectSpec<PiecePayload|RegionPayload>>,
    stateService: StateService,
): void {
  // Delete the old play specs.
  for (const {payload} of objectSpecs) {
    switch (payload.type) {
      case 'piece':
        stateService.delete(payload.$currentFaceIndex);
        stateService.delete(payload.$rotationDeg);
        break;
      case 'region':
        stateService.delete(payload.$contentSpecs);
        break;
    }
  }

  stateService.set(demoState.stagingState.$pieceSpecs, []);
  stateService.set(demoState.stagingState.$regionSpecs, []);
  stateService.set(demoState.$isStaging, true);
}

export const ROOT_SLOT_PREFIX = 'pbd.root-slot';

function setToPlay(
    demoState: DemoState,
    pieceSpecs: readonly PieceSpec[],
    regionSpecs: readonly RegionSpec[],
    stateService: StateService,
    vine: Vine,
): void {
  // // Add the root slot specs.
  // const rootSlotObjectSpecs: Array<ObjectSpec<RegionPayload>> = [];
  // for (let i = 0; i < 9; i++) {
  //   const $contentSpecs = stateService.add<ReadonlyArray<ContentSpec<Indexed>>>([]);
  //   rootSlotObjectSpecs.push({
  //     id: `${ROOT_SLOT_PREFIX}${i}`,
  //     type: ROOT_SLOT_TYPE,
  //     payload: {
  //       type: 'region',
  //       containerType: 'indexed',
  //       $contentSpecs,
  //     },
  //   });
  // }

  // Add the active specs.
  const $activeContentIds = stateService.add<ReadonlyArray<ContentSpec<'indexed'>>>([]);
  const $activeState = stateService.add<ActiveSpec>(activeSpec({
    $contentSpecs: $activeContentIds,
  }));

  // User defined object specs.
  const pieceObjectSpecIds: Array<StateId<ObjectSpec<PiecePayload>>> = [];
  for (const spec of pieceSpecs) {
    const $currentFaceIndex = stateService.add<number>(0);
    const $rotationDeg = stateService.add<number>(0);
    const payload: PiecePayload = {
      ...spec,
      type: 'piece',
      $currentFaceIndex,
      $rotationDeg,
    };

    pieceObjectSpecIds.push(stateService.add({
      ...spec,
      objectClass: ObjectClass.PIECE,
      type: PIECE_TYPE,
      payload,
    }));
  }

  const regionObjectSpecIds: Array<StateId<ObjectSpec<RegionPayload>>> = [];
  for (const spec of regionSpecs) {
    const payload: RegionPayload = {
      ...spec,
      type: 'region',
      containerType: spec.containerType,
      $contentSpecs: stateService.add([]),
      gridArea: spec.gridArea,
    };
    regionObjectSpecIds.push(stateService.add({
      ...spec,
      objectClass: ObjectClass.CONTAINER,
      type: REGION_TYPE,
      payload,
    }));
  }

  // Add the supply specs.
  const $supplyContentSpecs = stateService.add<ReadonlyArray<ContentSpec<'indexed'>>>(
      $pipe(
          pieceObjectSpecIds,
          $map(objectId => ({objectId, coordinate: createIndexed(0)})),
          $asArray(),
      ),
  );
  const $supply = stateService.add<SlotSpec<{}>>(slotSpec({
    type: SUPPLY_TYPE,
    $contentSpecs: $supplyContentSpecs,
    payload: {},
  }));

  const playState: PlayState = {
    $activeState,
    $supply,
    objectSpecIds: [
      ...pieceObjectSpecIds,
      ...regionObjectSpecIds,
    ],
  };

  stateService.set(demoState.$playState, playState);
  $$rootState.set(vine, () => demoState.$playState);
  stateService.set(demoState.$isStaging, false);
}

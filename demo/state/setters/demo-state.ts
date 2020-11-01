import { stream, Vine } from 'grapevine';
import { $asArray, $map, $pipe } from 'gs-tools/export/collect';
import { StateService } from 'gs-tools/export/state';
import { $stateService } from 'mask';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { createIndexed, Indexed } from '../../../src/coordinate/indexed';
import { ACTIVE_ID, ACTIVE_TYPE } from '../../../src/core/active';
import { ObjectSpec } from '../../../src/objects/object-spec';
import { $rootState } from '../../../src/objects/root-state-service';
import { ContentSpec } from '../../../src/payload/is-container';
import { PIECE_TYPE, REGION_TYPE, SUPPLY_TYPE } from '../../core/object-specs';
import { SUPPLY_ID } from '../../core/supply';
import { $demoState } from '../getters/demo-state';
import { $objectSpecs } from '../getters/play-state';
import { $pieceSpecs, $regionSpecs } from '../getters/staging-state';
import { DemoState } from '../types/demo-state';
import { PiecePayload } from '../types/piece-payload';
import { PieceSpec } from '../types/piece-spec';
import { PlayState } from '../types/play-state';
import { RegionPayload } from '../types/region-payload';
import { RegionSpec } from '../types/region-spec';


export const $setStaging = stream(
    'setStaging',
    vine => {
      return combineLatest([
        $demoState.get(vine),
        $objectSpecs.get(vine),
        $pieceSpecs.get(vine),
        $regionSpecs.get(vine),
        $stateService.get(vine),
      ])
      .pipe(
          map(([demoState, objectSpecs, pieceSpecs, regionSpecs, stateService]) => {
            if (!demoState) {
              return null;
            }

            return (isStaging: boolean) => {
              if (isStaging) {
                setToStaging(demoState, objectSpecs, stateService);
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

  // Add the supply specs.
  const $supplyContentSpecs = stateService.add<ReadonlyArray<ContentSpec<Indexed>>>(
      $pipe(
          pieceSpecs,
          $map(({id}) => ({objectId: id, coordinate: createIndexed(0)})),
          $asArray(),
      ),
  );
  const supplyObjectSpec: ObjectSpec<RegionPayload> = {
    id: SUPPLY_ID,
    type: SUPPLY_TYPE,
    payload: {
      type: 'region',
      containerType: 'indexed',
      $contentSpecs: $supplyContentSpecs,
      gridArea: null,
    },
  };

  // Add the active specs.
  const $activeContentIds = stateService.add<ReadonlyArray<ContentSpec<Indexed>>>([]);
  const activeObjectSpec: ObjectSpec<RegionPayload> = {
    id: ACTIVE_ID,
    type: ACTIVE_TYPE,
    payload: {
      type: 'region',
      containerType: 'indexed',
      $contentSpecs: $activeContentIds,
      gridArea: null,
    },
  };

  // User defined object specs.
  const pieceObjectSpecs: Array<ObjectSpec<PiecePayload>> = [];
  for (const spec of pieceSpecs) {
    const $currentFaceIndex = stateService.add<number>(0);
    const $rotationDeg = stateService.add<number>(0);
    const payload: PiecePayload = {
      ...spec,
      parentObjectId: SUPPLY_ID,
      type: 'piece',
      $currentFaceIndex,
      $rotationDeg,
    };
    pieceObjectSpecs.push({...spec, type: PIECE_TYPE, payload});
  }

  const regionObjectSpecs: Array<ObjectSpec<RegionPayload>> = [];
  for (const spec of regionSpecs) {
    const payload: RegionPayload = {
      ...spec,
      type: 'region',
      containerType: spec.containerType,
      $contentSpecs: stateService.add([]),
      gridArea: spec.gridArea,
    };
    regionObjectSpecs.push({...spec, type: REGION_TYPE, payload});
  }

  const playState: PlayState = {
    objectSpecs: [
      supplyObjectSpec,
      activeObjectSpec,
      ...pieceObjectSpecs,
      ...regionObjectSpecs,
    ],
  };

  stateService.set(demoState.$playState, playState);
  $rootState.set(vine, () => demoState.$playState);
  stateService.set(demoState.$isStaging, false);
}

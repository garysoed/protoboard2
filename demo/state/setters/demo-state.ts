import { stream, Vine } from 'grapevine';
import { $asArray, $map, $pipe } from 'gs-tools/export/collect';
import { StateService } from 'gs-tools/export/state';
import { $stateService } from 'mask';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { createIndexed, Indexed } from '../../../src/coordinate/indexed';
import { ACTIVE_ID, ACTIVE_TYPE } from '../../../src/core/active';
import { ObjectSpec } from '../../../src/objects/object-spec';
import { $objectSpecListId } from '../../../src/objects/object-spec-list';
import { ContentSpec } from '../../../src/payload/is-container';
import { PREVIEW_TYPE, ROOT_SLOT_TYPE, SUPPLY_TYPE } from '../../core/object-specs';
import { SUPPLY_ID } from '../../core/supply';
import { $demoState } from '../getters/demo-state';
import { $objectSpecs } from '../getters/play-state';
import { $pieceSpecs } from '../getters/staging-state';
import { DemoState } from '../types/demo-state';
import { PiecePayload } from '../types/piece-payload';
import { PieceSpec } from '../types/piece-spec';
import { PlayState } from '../types/play-state';
import { RegionPayload } from '../types/region-payload';


export const $setStaging = stream(
    'setStaging',
    vine => {
      return combineLatest([
        $demoState.get(vine),
        $objectSpecs.get(vine),
        $pieceSpecs.get(vine),
        $stateService.get(vine),
      ])
      .pipe(
          map(([demoState, objectSpecs, pieceSpecs, stateService]) => {
            if (!demoState) {
              return null;
            }

            return (isStaging: boolean) => {
              if (isStaging) {
                setToStaging(demoState, objectSpecs, stateService);
              } else {
                setToPlay(demoState, pieceSpecs ?? [], stateService, vine);
              }
            };
          }),
      );
    },
);

function setToStaging(
    demoState: DemoState,
    objectSpecs: ReadonlyArray<ObjectSpec<Partial<PiecePayload&RegionPayload>>>,
    stateService: StateService,
): void {
  // Delete the old play specs.
  for (const spec of objectSpecs) {
    if (spec.payload.$currentFaceIndex) {
      stateService.delete(spec.payload.$currentFaceIndex);
    }
    if (spec.payload.$rotationDeg) {
      stateService.delete(spec.payload.$rotationDeg);
    }
    if (spec.payload.$contentSpecs) {
      stateService.delete(spec.payload.$contentSpecs);
    }
  }

  stateService.set(demoState.stagingState.$pieceSpecs, []);
  stateService.set(demoState.$isStaging, true);
}

export const ROOT_SLOT_PREFIX = 'pbd.root-slot';

function setToPlay(
    demoState: DemoState,
    pieceSpecs: readonly PieceSpec[],
    stateService: StateService,
    vine: Vine,
): void {
  // Add the root slot specs.
  const rootSlotObjectSpecs: Array<ObjectSpec<RegionPayload>> = [];
  for (let i = 0; i < 9; i++) {
    const $contentSpecs = stateService.add<ReadonlyArray<ContentSpec<Indexed>>>([]);
    rootSlotObjectSpecs.push({
      id: `${ROOT_SLOT_PREFIX}${i}`,
      type: ROOT_SLOT_TYPE,
      payload: {type: 'indexed', $contentSpecs},
    });
  }

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
    payload: {type: 'indexed', $contentSpecs: $supplyContentSpecs},
  };

  // Add the active specs.
  const $activeContentIds = stateService.add<ReadonlyArray<ContentSpec<Indexed>>>([]);
  const activeObjectSpec: ObjectSpec<RegionPayload> = {
    id: ACTIVE_ID,
    type: ACTIVE_TYPE,
    payload: {type: 'indexed', $contentSpecs: $activeContentIds},
  };

  // User defined object specs.
  const pieceObjectSpecs: Array<ObjectSpec<PiecePayload>> = [];
  for (const spec of pieceSpecs) {
    const $currentFaceIndex = stateService.add<number>(0);
    const $rotationDeg = stateService.add<number>(0);
    const payload: PiecePayload = {
      ...spec,
      $currentFaceIndex,
      $rotationDeg,
    };
    pieceObjectSpecs.push({...spec, type: PREVIEW_TYPE, payload});
  }

  const playState: PlayState = {
    objectSpecs: [
      ...rootSlotObjectSpecs,
      supplyObjectSpec,
      activeObjectSpec,
      ...pieceObjectSpecs,
    ],
  };

  stateService.set(demoState.$playState, playState);
  $objectSpecListId.set(vine, () => demoState.$playState);
  stateService.set(demoState.$isStaging, false);
}

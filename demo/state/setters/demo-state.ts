import {$resolveState, $stateService, source} from 'grapevine';
import {$asArray, $filterDefined, $map, $pipe} from 'gs-tools/export/collect';
import {StateId, StateService} from 'gs-tools/export/state';
import {combineLatest, of as observableOf} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {createIndexed} from '../../../src/coordinate/indexed';
import {ContentSpec} from '../../../src/payload/is-container';
import {slotSpec, SlotSpec} from '../../../src/region/slot';
import {ObjectSpec} from '../../../src/types/object-spec';
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
                    $map(id => $resolveState.get(vine)(id)),
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
                    setToPlay(demoState, pieceSpecs ?? [], regionSpecs ?? [], stateService);
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
  stateService.modify(x => {
    // Delete the old play specs.
    for (const {payload} of objectSpecs) {
      switch (payload.type) {
        case 'piece':
          x.delete(payload.$currentFaceIndex);
          x.delete(payload.$rotationDeg);
          break;
        case 'region':
          x.delete(payload.$contentSpecs);
          break;
      }
    }

    x.set(demoState.stagingState.$pieceSpecs, []);
    x.set(demoState.stagingState.$regionSpecs, []);
    x.set(demoState.$isStaging, true);
  });
}

export const ROOT_SLOT_PREFIX = 'pbd.root-slot';

function setToPlay(
    demoState: DemoState,
    pieceSpecs: readonly PieceSpec[],
    regionSpecs: readonly RegionSpec[],
    stateService: StateService,
): void {
  stateService.modify(x => {
    // User defined object specs.
    const pieceObjectSpecIds: Array<StateId<ObjectSpec<PiecePayload>>> = [];
    for (const spec of pieceSpecs) {
      const $currentFaceIndex = x.add<number>(0);
      const $rotationDeg = x.add<number>(0);
      const payload: PiecePayload = {
        ...spec,
        type: 'piece',
        $currentFaceIndex,
        $rotationDeg,
      };

      pieceObjectSpecIds.push(x.add({
        ...spec,
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
        $contentSpecs: x.add([]),
        gridArea: spec.gridArea,
      };
      regionObjectSpecIds.push(x.add({
        ...spec,
        type: REGION_TYPE,
        payload,
      }));
    }

    // Add the supply specs.
    const $supplyContentSpecs = x.add<ReadonlyArray<ContentSpec<'indexed'>>>(
        $pipe(
            pieceObjectSpecIds,
            $map(objectId => ({objectId, coordinate: createIndexed(0)})),
            $asArray(),
        ),
    );
    const $supply = x.add<SlotSpec>(slotSpec({
      type: SUPPLY_TYPE,
      $contentSpecs: $supplyContentSpecs,
    }));

    const playState: PlayState = {
      $supply,
      objectSpecIds: [
        ...pieceObjectSpecIds,
        ...regionObjectSpecIds,
      ],
    };

    x.set(demoState.$playState, playState);
    x.set(demoState.$isStaging, false);
  });
}

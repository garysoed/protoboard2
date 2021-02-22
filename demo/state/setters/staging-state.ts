import {source} from 'grapevine';
import {StateService} from 'gs-tools/export/state';
import {$stateService} from 'mask';
import {combineLatest} from 'rxjs';
import {map} from 'rxjs/operators';

import {$faceIcons} from '../getters/piece-state';
import {$targetAreas} from '../getters/region-state';
import {$pieceSpecs, $regionSpecs, $stagingState} from '../getters/staging-state';
import {PieceSpec} from '../types/piece-spec';
import {RegionSpec} from '../types/region-spec';
import {GRID_AREAS} from '../types/region-state';
import {StagingState} from '../types/staging-state';


export const $addPieceSpecs = source(
    'addPieceSpecs',
    vine => {
      return combineLatest([
        $faceIcons.get(vine),
        $pieceSpecs.get(vine),
        $stagingState.get(vine),
      ])
          .pipe(
              map(([faceIcons, pieceSpecs, stagingState]) => {
                if (!faceIcons || !stagingState) {
                  return null;
                }
                const boundAddPieceSpec = addPieceSpec
                    .bind(undefined, pieceSpecs ?? [], stagingState, $stateService.get(vine));
                const d1 = boundAddPieceSpec.bind(undefined, faceIcons.d1);
                const d2 = boundAddPieceSpec.bind(undefined, faceIcons.d2);
                const d6 = boundAddPieceSpec.bind(undefined, faceIcons.d6);
                return {d1, d2, d6};
              }),
          );
    },
);

function addPieceSpec(
    currentPieceSpecs: readonly PieceSpec[],
    stagingState: StagingState,
    stateService: StateService,
    icons: readonly string[],
    componentTag: string,
): void {
  const pieceSpec: PieceSpec = {icons, componentTag};
  stateService.set(
      stagingState.$pieceSpecs,
      [...currentPieceSpecs, pieceSpec],
  );
}

export const $addRegionSpecs = source(
    'addRegionSpecs',
    vine => {
      return combineLatest([
        $regionSpecs.get(vine),
        $stagingState.get(vine),
        $targetAreas.get(vine),
      ])
          .pipe(
              map(([regionSpecs, stagingState, targetAreas]) => {
                if (!targetAreas || !stagingState) {
                  return undefined;
                }
                const boundAddPieceSpec = addRegionSpec
                    .bind(undefined, regionSpecs ?? [], stagingState, $stateService.get(vine));
                const deck = boundAddPieceSpec.bind(undefined, 'indexed', targetAreas.deck);
                return {deck};
              }),
          );

    },
);

function addRegionSpec(
    currentRegionSpecs: readonly RegionSpec[],
    stagingState: StagingState,
    stateService: StateService,
    containerType: any,
    targetArea: number,
    componentTag: string,
): void {
  const regionSpec: RegionSpec = {
    componentTag,
    containerType,
    gridArea: GRID_AREAS[targetArea],
  };
  stateService.set(stagingState.$regionSpecs, [...currentRegionSpecs, regionSpec]);
}

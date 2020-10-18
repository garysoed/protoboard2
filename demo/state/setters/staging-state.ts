import { stream } from 'grapevine';
import { SimpleIdGenerator } from 'gs-tools/export/random';
import { StateService } from 'gs-tools/export/state';
import { $stateService } from 'mask';
import { combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { $objectService } from '../../../src/objects/object-service';
import { $faceIcons } from '../getters/piece-state';
import { $pieceSpecs, $stagingState } from '../getters/staging-state';
import { PieceSpec } from '../types/piece-spec';
import { StagingState } from '../types/staging-state';


const idGenerator = new SimpleIdGenerator();
export const $addPieceSpecs = stream(
    'addPieceSpecs',
    vine => {
      const objectIds$ = $objectService.get(vine).pipe(switchMap(service => service.objectIds$));
      return combineLatest([
        $faceIcons.get(vine),
        objectIds$,
        $pieceSpecs.get(vine),
        $stateService.get(vine),
        $stagingState.get(vine),
      ])
      .pipe(
          map(([faceIcons, objectIds, pieceSpecs, stateService, stagingState]) => {
            if (!faceIcons || !stagingState) {
              return null;
            }
            const boundAddPieceSpec = addPieceSpec
                .bind(undefined, pieceSpecs ?? [], objectIds)
                .bind(undefined, stagingState, stateService);
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
    objectIds: ReadonlySet<string>,
    stagingState: StagingState,
    stateService: StateService,
    icons: readonly string[],
    componentTag: string,
): void {
  const id = `object-${idGenerator.generate(objectIds)}`;
  const pieceSpec: PieceSpec = {
    id,
    icons,
    componentTag,
  };
  stateService.set(
      stagingState.$pieceSpecs,
      [...currentPieceSpecs, pieceSpec],
  );
}

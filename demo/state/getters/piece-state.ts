import { stream } from 'grapevine';
import { $stateService } from 'mask';
import { combineLatest, of as observableOf } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { PieceEditorState } from '../types/piece-editor-state';

import { $demoState } from './demo-state';

export type EditedFaces = {readonly [K in keyof PieceEditorState]: number};
export const $editedFaces = stream<EditedFaces|null>(
    'editedFaces',
    vine => {
      return combineLatest([$stateService.get(vine), $demoState.get(vine)]).pipe(
          switchMap(([stateService, demoState]) => {
            if (!demoState) {
              return observableOf(null);
            }

            const d1$ = stateService.get(demoState.pieceEditorState.d1.$editedFace);
            const d2$ = stateService.get(demoState.pieceEditorState.d2.$editedFace);
            const d6$ = stateService.get(demoState.pieceEditorState.d6.$editedFace);
            return combineLatest([d1$, d2$, d6$]).pipe(
                map(([d1, d2, d6]) => {
                  if (d1 === null || d2 === null || d6 === null) {
                    return null;
                  }

                  return {d1, d2, d6};
                }),
            );
          }),
      );
    },
);

export type FaceIcons = {readonly [K in keyof PieceEditorState]: readonly string[]};
export const $faceIcons = stream<FaceIcons|null>(
    'faceIcons',
    vine => {
      return combineLatest([$stateService.get(vine), $demoState.get(vine)]).pipe(
          switchMap(([stateService, demoState]) => {
            if (!demoState) {
              return observableOf(null);
            }

            const d1$ = stateService.get(demoState.pieceEditorState.d1.$faceIcons);
            const d2$ = stateService.get(demoState.pieceEditorState.d2.$faceIcons);
            const d6$ = stateService.get(demoState.pieceEditorState.d6.$faceIcons);
            return combineLatest([d1$, d2$, d6$]).pipe(
                map(([d1, d2, d6]) => {
                  if (d1 === null || d2 === null || d6 === null) {
                    return null;
                  }

                  return {d1, d2, d6};
                }),
            );
          }),
      );
    },
);

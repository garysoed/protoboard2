import {stream} from 'grapevine';
import {$stateService} from 'mask';
import {combineLatest, of as observableOf} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {PieceEditorState} from '../types/piece-editor-state';

import {$demoState} from './demo-state';

export type EditedFaces = {readonly [K in keyof PieceEditorState]: number};
export const $editedFaces = stream<EditedFaces|undefined>(
    'editedFaces',
    vine => {
      return combineLatest([$stateService.get(vine), $demoState.get(vine)]).pipe(
          switchMap(([stateService, demoState]) => {
            if (!demoState) {
              return observableOf(undefined);
            }

            const d1$ = stateService.resolve(demoState.pieceEditorState.d1.$editedFace).self$;
            const d2$ = stateService.resolve(demoState.pieceEditorState.d2.$editedFace).self$;
            const d6$ = stateService.resolve(demoState.pieceEditorState.d6.$editedFace).self$;
            return combineLatest([d1$, d2$, d6$]).pipe(
                map(([d1, d2, d6]) => {
                  if (d1 === undefined || d2 === undefined || d6 === undefined) {
                    return undefined;
                  }

                  return {d1, d2, d6};
                }),
            );
          }),
      );
    },
);

export type FaceIcons = {readonly [K in keyof PieceEditorState]: readonly string[]};
export const $faceIcons = stream<FaceIcons|undefined>(
    'faceIcons',
    vine => {
      return combineLatest([$stateService.get(vine), $demoState.get(vine)]).pipe(
          switchMap(([stateService, demoState]) => {
            if (!demoState) {
              return observableOf(undefined);
            }

            const d1$ = stateService.resolve(demoState.pieceEditorState.d1.$faceIcons).self$;
            const d2$ = stateService.resolve(demoState.pieceEditorState.d2.$faceIcons).self$;
            const d6$ = stateService.resolve(demoState.pieceEditorState.d6.$faceIcons).self$;
            return combineLatest([d1$, d2$, d6$]).pipe(
                map(([d1, d2, d6]) => {
                  if (d1 === undefined || d2 === undefined || d6 === undefined) {
                    return undefined;
                  }

                  return {d1, d2, d6};
                }),
            );
          }),
      );
    },
);

import {source} from 'grapevine';
import {$stateService} from 'grapevine';
import {combineLatest, Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {PieceEditorState} from '../types/piece-editor-state';

import {$demoState} from './demo-state';


export type EditedFaces = {readonly [K in keyof PieceEditorState]: number};
export const $editedFaces = source<Observable<EditedFaces|undefined>>(
    'editedFaces',
    vine => {
      const stateService = $stateService.get(vine);
      return $demoState.get(vine).pipe(
          switchMap(demoState => {
            if (!demoState) {
              return of(undefined);
            }

            const d1$ = stateService.resolve(demoState.pieceEditorState.d1.$editedFace);
            const d2$ = stateService.resolve(demoState.pieceEditorState.d2.$editedFace);
            const d6$ = stateService.resolve(demoState.pieceEditorState.d6.$editedFace);
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
export const $faceIcons = source<Observable<FaceIcons|undefined>>(
    'faceIcons',
    vine => {
      const stateService = $stateService.get(vine);
      return $demoState.get(vine).pipe(
          switchMap(demoState => {
            if (!demoState) {
              return of(undefined);
            }

            const d1$ = stateService.resolve(demoState.pieceEditorState.d1.$faceIcons);
            const d2$ = stateService.resolve(demoState.pieceEditorState.d2.$faceIcons);
            const d6$ = stateService.resolve(demoState.pieceEditorState.d6.$faceIcons);
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

import {stream} from 'grapevine';
import {StateService} from 'gs-tools/export/state';
import {$stateService} from 'mask';
import {combineLatest} from 'rxjs';
import {map} from 'rxjs/operators';

import {$demoState} from '../getters/demo-state';
import {$editedFaces, $faceIcons, EditedFaces, FaceIcons} from '../getters/piece-state';
import {DemoState} from '../types/demo-state';
import {PieceEditorState} from '../types/piece-editor-state';
import {PieceType} from '../types/piece-type';


export const $setEditedFaces = stream(
    'setEditedFaces',
    vine => {
      return combineLatest([$stateService.get(vine), $demoState.get(vine)]).pipe(
          map(([stateService, demoState]) => {
            if (!demoState) {
              return null;
            }

            const d1 = setEditedFace.bind(undefined, stateService, demoState, PieceType.D1);
            const d2 = setEditedFace.bind(undefined, stateService, demoState, PieceType.D2);
            const d6 = setEditedFace.bind(undefined, stateService, demoState, PieceType.D6);
            return {d1, d2, d6};
          }),
      );
    },
);

function setEditedFace(
    stateService: StateService,
    demoState: DemoState,
    pieceType: keyof PieceEditorState,
    selectedIndex: number,
): void {
  stateService.set(demoState.pieceEditorState[pieceType].$editedFace, selectedIndex);
}

export const $setFaces = stream(
    'setFaces',
    vine => {
      return combineLatest([
        $demoState.get(vine),
        $editedFaces.get(vine),
        $faceIcons.get(vine),
        $stateService.get(vine),
      ])
          .pipe(
              map(([demoState, editedFaces, faceIcons, stateService]) => {
                if (!faceIcons || editedFaces === undefined || !demoState) {
                  return null;
                }

                const boundSetFace = setFace.bind(
                    undefined,
                    editedFaces,
                    demoState.pieceEditorState,
                    faceIcons,
                    stateService,
                );
                const d1 = boundSetFace.bind(undefined, PieceType.D1);
                const d2 = boundSetFace.bind(undefined, PieceType.D2);
                const d6 = boundSetFace.bind(undefined, PieceType.D6);
                return {d1, d2, d6};
              }),
          );
    },
);

function setFace(
    editedFaces: EditedFaces,
    editorState: PieceEditorState,
    faceIcons: FaceIcons,
    stateService: StateService,
    pieceType: PieceType,
    newFace: string,
): void {
  const newFaces = [...faceIcons[pieceType]];
  newFaces[editedFaces[pieceType]] = newFace;
  stateService.set(editorState[pieceType].$faceIcons, newFaces);
}

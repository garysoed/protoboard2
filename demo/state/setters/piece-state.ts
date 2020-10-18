import { stream } from 'grapevine';
import { StateService } from 'gs-tools/export/state';
import { $stateService } from 'mask';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { EditorState, PieceTypes } from '../editor-state';
import { $demoState } from '../getters/demo-state';
import { $editedFaces, $faceIcons, EditedFaces, FaceIcons } from '../getters/piece-state';
import { DemoState } from '../types/demo-state';


export const $setEditedFaces = stream(
    'setEditedFaces',
    vine => {
      return combineLatest([$stateService.get(vine), $demoState.get(vine)]).pipe(
          map(([stateService, demoState]) => {
            if (!demoState) {
              return null;
            }

            const d1 = setEditedFace.bind(undefined, stateService, demoState, PieceTypes.D1);
            const d2 = setEditedFace.bind(undefined, stateService, demoState, PieceTypes.D2);
            const d6 = setEditedFace.bind(undefined, stateService, demoState, PieceTypes.D6);
            return {d1, d2, d6};
          }),
      );
    },
);

function setEditedFace(
    stateService: StateService,
    demoState: DemoState,
    pieceType: keyof EditorState,
    selectedIndex: number,
): void {
  stateService.set(demoState.editorState[pieceType].$editedFace, selectedIndex);
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
            if (!faceIcons || editedFaces === null || !demoState) {
              return null;
            }

            const boundSetFace = setFace.bind(
                undefined,
                editedFaces,
                demoState.editorState,
                faceIcons,
                stateService,
            );
            const d1 = boundSetFace.bind(undefined, PieceTypes.D1);
            const d2 = boundSetFace.bind(undefined, PieceTypes.D2);
            const d6 = boundSetFace.bind(undefined, PieceTypes.D6);
            return {d1, d2, d6};
          }),
      );
    },
);

function setFace(
    editedFaces: EditedFaces,
    editorState: EditorState,
    faceIcons: FaceIcons,
    stateService: StateService,
    pieceType: PieceTypes,
    newFace: string,
): void {
  const newFaces = [...faceIcons[pieceType]];
  newFaces[editedFaces[pieceType]] = newFace;
  stateService.set(editorState[pieceType].$faceIcons, newFaces);
}

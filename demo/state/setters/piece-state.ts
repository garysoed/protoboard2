import {source} from 'grapevine';
import {$stateService} from 'grapevine';
import {StateService} from 'gs-tools/export/state';
import {combineLatest} from 'rxjs';
import {map} from 'rxjs/operators';

import {$demoState} from '../getters/demo-state';
import {$editedFaces, $faceIcons, EditedFaces, FaceIcons} from '../getters/piece-state';
import {DemoState} from '../types/demo-state';
import {PieceEditorState} from '../types/piece-editor-state';
import {PieceType} from '../types/piece-type';


export const $setEditedFaces = source(
    'setEditedFaces',
    vine => {
      return $demoState.get(vine).pipe(
          map(demoState => {
            if (!demoState) {
              return null;
            }

            const d1 = setEditedFace.bind(undefined, $stateService.get(vine), demoState, PieceType.D1);
            const d2 = setEditedFace.bind(undefined, $stateService.get(vine), demoState, PieceType.D2);
            const d6 = setEditedFace.bind(undefined, $stateService.get(vine), demoState, PieceType.D6);
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
  stateService.modify(x => x.set(demoState.pieceEditorState[pieceType].$editedFace, selectedIndex));
}

export const $setFaces = source(
    'setFaces',
    vine => {
      return combineLatest([
        $demoState.get(vine),
        $editedFaces.get(vine),
        $faceIcons.get(vine),
      ])
          .pipe(
              map(([demoState, editedFaces, faceIcons]) => {
                if (!faceIcons || editedFaces === undefined || !demoState) {
                  return null;
                }

                const boundSetFace = setFace.bind(
                    undefined,
                    editedFaces,
                    demoState.pieceEditorState,
                    faceIcons,
                    $stateService.get(vine),
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
  stateService.modify(x => x.set(editorState[pieceType].$faceIcons, newFaces));
}

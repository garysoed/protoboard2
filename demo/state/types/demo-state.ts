import {source} from 'grapevine';
import {StateId} from 'gs-tools/export/state';
import {$rootId} from 'mask';
import {Observable} from 'rxjs';

import {PieceEditorState} from './piece-editor-state';
import {PlayState} from './play-state';
import {RegionEditorState} from './region-editor-state';
import {StagingState} from './staging-state';


export interface DemoState {
  readonly $isStaging: StateId<boolean>;
  readonly $playState: StateId<PlayState>;
  readonly pieceEditorState: PieceEditorState;
  readonly regionEditorState: RegionEditorState;
  readonly stagingState: StagingState;
}

export const $demoStateId = source<Observable<StateId<DemoState>|undefined>>(
    'demoStateId',
    vine => $rootId.get(vine),
);

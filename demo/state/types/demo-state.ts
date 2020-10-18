import { source, stream } from 'grapevine';
import { StateId } from 'gs-tools/export/state';
import { $rootId } from 'mask';

import { EditorState } from '../editor-state';

import { PlayState } from './play-state';
import { StagingState } from './staging-state';


export interface DemoState {
  readonly editorState: EditorState;
  readonly $isStaging: StateId<boolean>;
  readonly stagingState: StagingState;
  readonly $playState: StateId<PlayState>;
}

export const $demoStateId = stream<StateId<DemoState>|null>(
    'demoStateId',
    vine => $rootId.get(vine),
);

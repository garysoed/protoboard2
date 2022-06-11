import {MutableState} from 'gs-tools/export/state';

import {FaceId} from '../id/face-id';

export interface IsMultifaced {
  readonly currentFaceIndex: MutableState<number>;
  readonly faces: ReadonlyArray<FaceId<unknown>>;
}

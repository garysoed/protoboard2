import { RegionState } from './region-state';
import { RegionType } from './region-type';

export interface RegionEditorState {
  readonly [RegionType.DECK]: RegionState;
}

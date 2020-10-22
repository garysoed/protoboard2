import { IsContainer } from '../../../src/payload/is-container';

import { GridArea } from './region-state';

export interface RegionPayload extends IsContainer<any> {
  readonly type: 'region';
  readonly gridArea: GridArea|null;
}

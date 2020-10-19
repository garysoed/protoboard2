import { IsContainer } from '../../../src/payload/is-container';

export interface RegionPayload extends IsContainer<any> {
  readonly type: 'region';
}

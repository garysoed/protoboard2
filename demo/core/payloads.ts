import { IsContainer } from '../../src/payload/is-container';

export enum GridArea {
  SMALL1 = 'small1',
  SMALL2 = 'small2',
  SMALL3 = 'small3',
  SMALL4 = 'small4',
  SMALL5 = 'small5',
  SMALL6 = 'small6',
  SIDE = 'side',
  LARGE = 'large',
}

export interface GenericRegionPayload extends IsContainer<any> {
  readonly gridArea: GridArea;
}

import {GridArea} from './region-state';

export interface RegionSpec {
  readonly id: string;
  readonly componentTag: string;
  readonly gridArea: GridArea;
  readonly containerType: any;
}

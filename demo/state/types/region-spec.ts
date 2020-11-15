import {GridArea} from './region-state';

export interface RegionSpec {
  readonly componentTag: string;
  readonly gridArea: GridArea;
  readonly containerType: any;
}

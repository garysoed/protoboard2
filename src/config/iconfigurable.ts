import {IConfiguration} from './iconfiguration';

export interface IConfigurable {
  addConfig(config: IConfiguration): void
}

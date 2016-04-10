import ComponentConfig from '../component/component-config';
import IGameConfig from './i-game-config';


class DefaultGameConfig implements IGameConfig {
  get componentConfigList(): ComponentConfig[] {
    return [
      new ComponentConfig('pb-token')
    ];
  }
}

export default DefaultGameConfig;

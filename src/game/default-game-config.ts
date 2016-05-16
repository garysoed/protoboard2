import IGameConfig from './i-game-config';
import Token from '../component/token';


/**
 * Default game configuration.
 *
 * This should satisfy most of your use cases.
 */
class DefaultGameConfig implements IGameConfig {
  get componentList(): gs.ICtor<any>[] {
    return [
      Token,
    ];
  }
}

export default DefaultGameConfig;

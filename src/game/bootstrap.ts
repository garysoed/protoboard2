import ComponentConfig from '../component/component-config';
import DefaultGameConfig from './default-game-config';
import Game from './game';
import IGameConfig from './i-game-config';


// @extern pb.game.bootstrap
function bootstrap(config: IGameConfig = new DefaultGameConfig()): Game {
  // TODO: Validate inputs
  
  config.componentConfigList.forEach((componentConfig: ComponentConfig) => {
    componentConfig.register();
  });
  return new Game();
}

export default bootstrap;

import DefaultGameConfig from './default-game-config';
import Game from './game';
import IGameConfig from './i-game-config';
import Injector from '../../node_modules/gs-tools/src/inject/injector';


/**
 * Bootstraps the game.
 *
 * @param config The configuration object used to bootstrap the game.
 * @param injector Custom instance of injector. Used for testing only.
 * @return A new instance of the game.
 */
function bootstrap(
    config: IGameConfig = new DefaultGameConfig(),
    injector: Injector = new Injector()): Game {
  config.componentList.forEach((componentName: string) => {
    injector.getBoundValue(componentName).register();
  });
  return new Game();
}

export default bootstrap;

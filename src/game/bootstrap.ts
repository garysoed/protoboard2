import DefaultGameConfig from './default-game-config';
import Game from './game';
import IGameConfig from './i-game-config';
import Injector from '../../node_modules/gs-tools/src/inject/injector';
import KeyboardEventPolyfill from '../../node_modules/gs-tools/src/ui/keyboard-event-polyfill';


/**
 * Bootstraps the game.
 *
 * @param config The configuration object used to bootstrap the game.
 * @param injector Custom instance of injector. Used for testing only.
 * @param root The root HTML object to listen to key events and mouse movements.
 * @return A new instance of the game.
 */
function bootstrap(
    config: IGameConfig = new DefaultGameConfig(),
    injector: Injector = new Injector(),
    root: HTMLElement = document.body): Game {
  KeyboardEventPolyfill.polyfill();
  injector.bindValue('pb-root', root);
  config.componentList.forEach((componentName: string) => {
    injector.getBoundValue(componentName).register();
  });
  return new Game();
}

export default bootstrap;

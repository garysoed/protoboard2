import {Arrays} from '../../node_modules/gs-tools/src/collection/arrays';
import DefaultGameConfig from './default-game-config';
import {Element} from '../util/a-element';
import {ElementConfig} from '../../node_modules/gs-tools/src/webc/element-config';
import {ElementRegistrar} from '../../node_modules/gs-tools/src/webc/element-registrar';
import Game from './game';
import IGameConfig from './i-game-config';
import Injector from '../../node_modules/gs-tools/src/inject/injector';
import KeyboardEventPolyfill from '../../node_modules/gs-tools/src/ui/keyboard-event-polyfill';


export class Bootstrap {
  private static __ELEMENT_CONFIG: symbol = Symbol('elementConfig');

  private static getElementConfig_(ctor: gs.ICtor<any>, injector: Injector): ElementConfig {
    if (ctor[Bootstrap.__ELEMENT_CONFIG] !== undefined) {
      return ctor[Bootstrap.__ELEMENT_CONFIG];
    }

    let componentConfig = Element.getConfig(ctor);
    let elementConfig = ElementConfig.newInstance(
        () => {
          return injector.instantiate(ctor);
        },
        componentConfig.tag,
        componentConfig.templateUrl,
        Arrays.of(componentConfig.dependencies || [])
            .map((dependency: gs.ICtor<any>) => {
              return Bootstrap.getElementConfig_(dependency, injector);
            })
            .asArray(),
        componentConfig.cssUrl);
    ctor[Bootstrap.__ELEMENT_CONFIG] = elementConfig;
    return elementConfig;
  }

  /**
   * Bootstraps the app.
   *
   * @param config The game configuration object. Defaults to the provided GameConfig.
   * @param root The document root. Defaults to `document.body`.
   * @return Promise that will be resolved when all the custom elements have been registered
   *    successfully.
   */
  static bootstrap(
      config: IGameConfig = new DefaultGameConfig(),
      root: HTMLElement = document.body): Promise<Game> {
    KeyboardEventPolyfill.polyfill();

    Injector.bindProvider(() => root, 'pb-root');
    let injector = Injector.newInstance();
    let registrar = ElementRegistrar.newInstance();

    let promises = Arrays.of(config.componentList)
        .map((componentCtor: gs.ICtor<any>): Promise<void> => {
          return registrar.register(Bootstrap.getElementConfig_(componentCtor, injector));
        })
        .asArray();
    return Promise.all(promises).then(() => new Game());
  }
}

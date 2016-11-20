import Asserts from '../../node_modules/gs-tools/src/assert/asserts';
import Bind from '../../node_modules/gs-tools/src/inject/a-bind';
import {Checks} from '../../node_modules/gs-tools/src/checks';
import Doms from '../../node_modules/gs-tools/src/ui/doms';
import {IConfigurable} from './iconfigurable';
import {IConfiguration} from './iconfiguration';
import {Iterables} from '../../node_modules/gs-tools/src/collection/iterables';
import {Sets} from '../../node_modules/gs-tools/src/collection/sets';


export class ConfigService {
  private static CONFIGURATIONS_: symbol = Symbol('configuration');

  private getConfigurationMap_(element: any): Map<string, IConfiguration> {
    return element[ConfigService.CONFIGURATIONS_];
  }

  attach(configuration: IConfiguration, target: IConfigurable): void {
    let map = this.getConfigurationMap_(target);
    if (!!map) {
      target[ConfigService.CONFIGURATIONS_] = new Map<string, IConfiguration>();
      map = target[ConfigService.CONFIGURATIONS_];
    }
    map.set(configuration.name, configuration);
  }

  getConfig(element: HTMLElement, name: string): IConfiguration {
    let foundConfig: IConfiguration = null;

    Iterables.of(Doms.parentIterable(element, true /* bustShadow */))
        .iterate((element: HTMLElement, breakFn: () => void) => {
          let map = this.getConfigurationMap_(element);
          if (!!map && map.has(name)) {
            foundConfig = map.get(name);
            breakFn();
          }
        });

    return foundConfig;
  }

  isConfigurable(target: HTMLElement): target is HTMLElement & IConfigurable {
    return target['addConfig'] instanceof Function;
  }
}

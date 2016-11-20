import {Arrays} from '../../node_modules/gs-tools/src/collection/arrays';
import {Attributes} from '../../node_modules/gs-tools/src/ui/attributes';
import {BaseElement} from '../../node_modules/gs-tools/src/webc/base-element';
import Cache from '../../node_modules/gs-tools/src/data/a-cache';
import {Checks} from '../../node_modules/gs-tools/src/checks';
import {ConfigService} from './config-service';
import {IConfigurable} from './iconfigurable';
import {IConfiguration} from './iconfiguration'
import {Element} from '../util/a-element';
import Inject from '../../node_modules/gs-tools/src/inject/a-inject';
import {Maps} from '../../node_modules/gs-tools/src/collection/maps';


@Element({
  tag: 'pb-action-config',
  templateUrl: 'src/data/action-config.html',
})
export class ActionConfig extends BaseElement implements IConfiguration {
  private configService_: ConfigService;
  private element_: HTMLElement;

  constructor(
      @Inject('pb.config.ConfigService') configService: ConfigService) {
    super();
    this.configService_ = configService;
  }

  @Cache()
  private getEntries_(): {[key: string]: string} {
    let entryElements = this.element_.querySelectorAll('pb-entry');
    let entries: [string, string][] = <[string, string][]> Arrays.fromNodeList(entryElements)
        .map((entryElement: HTMLElement) => {
          let attributes = Attributes.get(entryElement);
          return [attributes['name'], entryElement.innerText];
        })
        .filter((entry: [string, string]) => {
          return !!entry[0];
        })
        .asArray();
    return Maps.of<string, string>(new Map<string, string>(entries)).asRecord();
  }

  getEntry(key: string): string {
    return this.getEntries_()[key];
  }

  @Cache()
  get name(): string {
    if (!this.element_) {
      return null;
    } else {
      return Attributes.get(this.element_)['name'];
    }
  }

  onCreated(element: HTMLElement): void {
    this.element_ = element;
    Cache.clear(this);
  }



  onInserted(): void {
    let parentElement = this.element_.parentElement;
    if (this.configService_.isConfigurable(parentElement)) {
      this.configService_.attach(this, parentElement);
    } else {
      throw new Error(
          `Element ${parentElement} is expected to implement IConfigurable, but does not`);
    }
  }
}

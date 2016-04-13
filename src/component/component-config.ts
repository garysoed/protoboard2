import BaseComponent from './base-component';
import Cache from '../../node_modules/gs-tools/src/data/a-cache';
import Checks from '../../node_modules/gs-tools/src/checks';
import Http from '../../node_modules/gs-tools/src/net/http';
import Log from '../../node_modules/gs-tools/src/log';


const LOG = new Log('pb.component.ComponentConfig');

/**
 * Configuration object of all components.
 */
class ComponentConfig {
  private static __instance: symbol = Symbol('instance');

  private ctor_: new () => BaseComponent;
  private tag_: string;
  private templateUrl_: string;
  private xtag_: xtag.IInstance;

  /**
   * @param ctor The constructor of the component. This cannot take any arguments, so bind all the
   *    arguments prior to passing it to here.
   * @param tag The tag name of the component.
   * @param templateUrl The component's template URL.
   */
  constructor(
      ctor: new () => BaseComponent,
      tag: string,
      templateUrl: string,
      xtag: xtag.IInstance) {
    this.ctor_ = ctor;
    this.tag_ = tag;
    this.templateUrl_ = templateUrl;
    this.xtag_ = xtag;
  }

  getLifecycleConfig_(content: string): xtag.ILifecycleConfig {
    let ctor = this.ctor_;
    return {
      attributeChanged: function(attrName: string, oldValue: string, newValue: string): void {
        ComponentConfig.runOnInstance_(this, (component: BaseComponent) => {
          component.onAttributeChanged(attrName, oldValue, newValue);
        });
      },
      created: function(): void {
        let instance = new ctor();
        this[ComponentConfig.__instance] = instance;
        let shadow = this.createShadowRoot();
        shadow.innerHTML = content;

        instance.onCreated();
      },
      inserted: function(): void {
        ComponentConfig.runOnInstance_(this, (component: BaseComponent) => {
          component.onInserted();
        });
      },
      removed: function(): void {
        ComponentConfig.runOnInstance_(this, (component: BaseComponent) => {
          component.onRemoved();
        });
      },
    };
  }

  /**
   * Registers the component in the DOM.
   *
   * @return Promise that will be resolved when the registration is complete.
   */
  @Cache()
  register(): Promise<void> {
    // TODO: Assert xtag is defined.
    return Http.get(this.templateUrl_)
        .send()
        .then(
            (content: string) => {
              this.xtag_.register(
                  this.tag_,
                  {
                    lifecycle: this.getLifecycleConfig_(content),
                  });
              Log.info(LOG, `Registered ${this.tag_}`);
            },
            (error: string) => {
              Log.error(LOG, `Failed to register ${this.tag_}. Error: ${error}`);
            });
  }

  /**
   * Runs the given function on an instance stored in the given element.
   *
   * @param el The element containing the instance to run the function on.
   * @param callback The function to run on the instance.
   */
  private static runOnInstance_(el: any, callback: (component: BaseComponent) => void): void {
    let instance = el[ComponentConfig.__instance];
    if (Checks.isInstanceOf(instance, BaseComponent)) {
      callback(instance);
    } else {
      throw Error(`Cannot find valid instance on element ${el.nodeName}`);
    }
  }
}

export default ComponentConfig;

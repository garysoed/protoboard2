import BaseComponent from './base-component';
import BaseDispose from '../../node_modules/gs-tools/src/dispose/base-disposable';
import Cache from '../../node_modules/gs-tools/src/data/a-cache';
import Checks from '../../node_modules/gs-tools/src/checks';
import Http from '../../node_modules/gs-tools/src/net/http';
import Inject from '../../node_modules/gs-tools/src/inject/a-inject';
import Injector from '../../node_modules/gs-tools/src/inject/injector';
import Log from '../../node_modules/gs-tools/src/log';


const LOG = new Log('pb.component.ComponentConfig');

/**
 * Configuration object of all components.
 */
class ComponentConfig extends BaseDispose {
  private static __instance: symbol = Symbol('instance');

  private cssUrl_: string;
  private ctor_: new () => BaseComponent;
  private dependencies_: string[];
  private injector_: Injector;
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
      @Inject('$gsInjector') injector: Injector,
      ctor: new () => BaseComponent,
      tag: string,
      templateUrl: string,
      xtag: xtag.IInstance,
      dependencies: string[] = [],
      cssUrl?: string) {
    super();
    this.cssUrl_ = cssUrl;
    this.ctor_ = ctor;
    this.dependencies_ = dependencies;
    this.injector_ = injector;
    this.tag_ = tag;
    this.templateUrl_ = templateUrl;
    this.xtag_ = xtag;
  }

  private getLifecycleConfig_(content: string): xtag.ILifecycleConfig {
    let ctor = this.ctor_;
    let injector = this.injector_;
    let addDisposable = this.addDisposable.bind(this);
    return {
      attributeChanged: function(attrName: string, oldValue: string, newValue: string): void {
        ComponentConfig.runOnInstance_(this, (component: BaseComponent) => {
          component.onAttributeChanged(attrName, oldValue, newValue);
        });
      },
      created: function(): void {
        let instance = injector.instantiate(ctor);
        addDisposable(instance);

        this[ComponentConfig.__instance] = instance;
        let shadow = this.createShadowRoot();
        shadow.innerHTML = content;

        instance.onCreated(this);
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
    return Promise
        .all(this.dependencies_.map((dependency: string) => {
          return this.injector_.getBoundValue(dependency).register();
        }))
        .then(() => {
          let promises = [Http.get(this.templateUrl_).send()];
          if (this.cssUrl_) {
            promises.push(Http.get(this.cssUrl_).send());
          }
          return Promise.all(promises);
        })
        .then(
            (results: any[]) => {
              let [content, css] = results;

              if (css !== undefined) {
                content = `<style>${css}</style>\n${content}`;
              }

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

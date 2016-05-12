import Asserts from '../../node_modules/gs-tools/src/assert/asserts';
import BaseElement from '../util/base-element';
import ComponentConfig from './component-config';
import Injector from '../../node_modules/gs-tools/src/inject/injector';


const __configName = Symbol('configName');

/**
 * Configures a component.
 */
type IComponentConfig = {
  /**
   * URL of the CSS file, if any.
   *
   * The content of the CSS file will be appended to the template in a `<style>` element.
   */
  cssUrl?: string,

  /**
   * Component constructor of the dependencies.
   */
  dependencies?: gs.ICtor<any>[],

  /**
   * Tag name of the component.
   */
  tag: string,

  /**
   * URL to load the component template.
   */
  templateUrl: string,
};


/**
 * Interface for the annotation.
 *
 * See [[Component]] for more documentation.
 */
interface IComponent {
  /**
   * Annotates the class to indicate that it is a component class.
   *
   * @param config The component configuration object.
   */
  (config: IComponentConfig): ClassDecorator;

  /**
   * Getss the configuration name of the given component.
   *
   * @param ctor Constructor of the component class whose configuration name should be returned.
   */
  getConfigName(ctor: gs.ICtor<BaseElement>): string;
}

/**
 * Annotates a class as a component.
 *
 * To create a new component class, you need to do the following:
 *
 * 1.  Create a new class extending [[BaseElement]].
 * 1.  Create an html file containing the component's template. This will be used as the content
 *     of the component.
 * 1.  Annotate the class with this annotation. Set the tag name and template URL of the file
 *     created in the previous step.
 * 1.  In the [[GameConfig]] object, return the configName as part of the componentConfigList.
 *
 * For example:
 *
 * ```typescript
 * import bootstrap from './game/bootstrap';
 * import Component from './component/a-component';
 *
 * \@Component({
 *   tag: 'custom-component',
 *   templateUrl: 'custom-component.html'
 * })
 * class CustomComponent {
 *   // ...
 * }
 *
 * bootstrap({
 *   componentConfigList: [
 *     Component.getConfigName(CustomComponent)
 *   ]
 * });
 * ```
 *
 * In your main html file, you can do:
 *
 * ```html
 * <body>
 *   <custom-component></custom-component>
 * </body>
 * ```
 *
 * @param config The configuration object.
 */
const Component: IComponent = <any> function(config: IComponentConfig): ClassDecorator {
  return function<C extends gs.ICtor<any>>(ctor: C): void {
    Asserts.ctor(ctor).to.extend(BaseElement)
        .orThrows(`${ctor.name} should extend BaseElement`);
    Asserts.string(config.tag).toNot.beEmpty()
        .orThrows(`Configuration for ${ctor.name} should have a non empty tag name`);
    Asserts.string(config.templateUrl).toNot.beEmpty()
        .orThrows(`Configuration for ${ctor.name} should have a non empty template URL`);
    Asserts.any(window['xtag']).to.beDefined().orThrows(`Required xtag library not found`);
    ctor[__configName] = config.tag;

    let dependencies = config.dependencies || [];
    let dependencyTags = dependencies.map((dependency: typeof BaseElement) => {
      return Component.getConfigName(dependency);
    });

    Injector.bind(ComponentConfig, config.tag, {
      1: ctor,
      2: config.tag,
      3: config.templateUrl,
      4: window['xtag'],
      5: dependencyTags,
      6: config.cssUrl,
    });
  };
};

/**
 * Retrieves the configuration name of the given component constructor.
 *
 * @param ctor The component constructor to return the configuration of.
 * @return The configuration name of the given component constructor.
 */
Component.getConfigName = function(ctor: gs.ICtor<BaseElement>): string {
  return ctor[__configName];
};

export default Component;

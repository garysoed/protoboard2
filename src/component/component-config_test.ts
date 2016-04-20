import TestBase from '../test-base';
TestBase.setup();

import BaseComponent from './base-component';
import ComponentConfig from './component-config';
import Http from '../../node_modules/gs-tools/src/net/http';
import Log from '../../node_modules/gs-tools/src/log';
import Mocks from '../../node_modules/gs-tools/src/mock/mocks';
import TestDispose from '../../node_modules/gs-tools/src/testing/test-dispose';


describe('component.ComponentConfig', () => {
  const CSS_URL = 'cssUrl';
  const TAG = 'tag';
  const TEMPLATE_URL = 'template url';

  let mockDependencies;
  let mockInjector;
  let mockXtag;
  let config;

  class TestComponent extends BaseComponent { }

  beforeEach(() => {
    mockDependencies = [];
    mockInjector = jasmine.createSpyObj('Injector', ['getBoundValue', 'instantiate']);
    mockXtag = jasmine.createSpyObj('Xtag', ['register']);
    config = new ComponentConfig(
        mockInjector,
        TestComponent,
        TAG,
        TEMPLATE_URL,
        mockXtag,
        mockDependencies,
        CSS_URL);
    TestDispose.add(config);
  });

  describe('getLifecycleConfig_', () => {
    it('should return the config with the correct attribute changed handler', () => {
      let attrName = 'attrName';
      let oldValue = 'oldValue';
      let newValue = 'newValue';
      let mockElement = Mocks.object('Element');
      let mockComponent = jasmine.createSpyObj('Component', ['onAttributeChanged']);

      let runOnInstanceSpy = spyOn(ComponentConfig, 'runOnInstance_');

      config['getLifecycleConfig_']('content')
          .attributeChanged.call(mockElement, attrName, oldValue, newValue);

      expect(ComponentConfig['runOnInstance_'])
          .toHaveBeenCalledWith(mockElement, jasmine.any(Function));

      runOnInstanceSpy.calls.argsFor(0)[1](mockComponent);
      expect(mockComponent.onAttributeChanged).toHaveBeenCalledWith(attrName, oldValue, newValue);
    });

    it('should return the config with the correct created handler', () => {
      let content = 'content';
      let mockShadowRoot = Mocks.object('ShadowRoot');
      let mockElement = jasmine.createSpyObj('Element', ['createShadowRoot']);
      let mockComponent = Mocks.disposable('Component');
      mockComponent.onCreated = jasmine.createSpy('onCreated');
      mockInjector.instantiate.and.returnValue(mockComponent);

      mockElement.createShadowRoot.and.returnValue(mockShadowRoot);

      spyOn(TestComponent.prototype, 'onCreated');

      config['getLifecycleConfig_'](content).created.call(mockElement);

      expect(mockElement[ComponentConfig['__instance']]).toEqual(mockComponent);
      expect(mockComponent.onCreated).toHaveBeenCalledWith(mockElement);
      expect(mockShadowRoot.innerHTML).toEqual(content);
    });

    it('should return the config with the correct inserted handler', () => {
      let mockElement = Mocks.object('Element');
      let mockComponent = jasmine.createSpyObj('Component', ['onInserted']);

      let runOnInstanceSpy = spyOn(ComponentConfig, 'runOnInstance_');

      config['getLifecycleConfig_']('content').inserted.call(mockElement);

      expect(ComponentConfig['runOnInstance_'])
          .toHaveBeenCalledWith(mockElement, jasmine.any(Function));

      runOnInstanceSpy.calls.argsFor(0)[1](mockComponent);
      expect(mockComponent.onInserted).toHaveBeenCalledWith();
    });

    it('should return the config with the correct removed handler', () => {
      let mockElement = Mocks.object('Element');
      let mockComponent = jasmine.createSpyObj('Component', ['onRemoved']);

      let runOnInstanceSpy = spyOn(ComponentConfig, 'runOnInstance_');

      config['getLifecycleConfig_']('content').removed.call(mockElement);

      expect(ComponentConfig['runOnInstance_'])
          .toHaveBeenCalledWith(mockElement, jasmine.any(Function));

      runOnInstanceSpy.calls.argsFor(0)[1](mockComponent);
      expect(mockComponent.onRemoved).toHaveBeenCalledWith();
    });
  });

  describe('register', () => {
    it('should return promise that registers the element correctly', (done: any) => {
      let dependencyString = 'dependencyString';
      mockDependencies.push(dependencyString);

      let mockDependency = jasmine.createSpyObj('Dependency', ['register']);
      mockDependency.register.and.returnValue(Promise.resolve());
      mockInjector.getBoundValue.and.returnValue(mockDependency);

      let templateContent = 'templateContent';
      let mockTemplateRequest = jasmine.createSpyObj('TemplateRequest', ['send']);
      mockTemplateRequest.send.and.returnValue(Promise.resolve(templateContent));

      let cssContent = 'cssContent';
      let mockCssRequest = jasmine.createSpyObj('CssRequest', ['send']);
      mockCssRequest.send.and.returnValue(Promise.resolve(cssContent));

      spyOn(Http, 'get').and.callFake((url: string) => {
        switch (url) {
          case TEMPLATE_URL:
            return mockTemplateRequest;
          case CSS_URL:
            return mockCssRequest;
          default:
            return null;
        }
      });

      let mockLifecycleConfig = Mocks.object('LifecycleConfig');
      spyOn(config, 'getLifecycleConfig_').and.returnValue(mockLifecycleConfig);

      config.register()
          .then(() => {
            expect(mockXtag.register).toHaveBeenCalledWith(
                TAG,
                {
                  lifecycle: mockLifecycleConfig,
                });
            expect(config['getLifecycleConfig_'])
                .toHaveBeenCalledWith(`<style>${cssContent}</style>\n${templateContent}`);

            expect(mockInjector.getBoundValue).toHaveBeenCalledWith(dependencyString);
            expect(mockDependency.register).toHaveBeenCalledWith();
            done();
          }, done.fail);
    });

    it('should log error if the template URL failed to load', (done: any) => {
      let error = 'error';

      let mockTemplateRequest = jasmine.createSpyObj('TemplateRequest', ['send']);
      mockTemplateRequest.send.and.returnValue(Promise.resolve('templateContent'));

      spyOn(Http, 'get').and.returnValue(mockTemplateRequest);
      mockTemplateRequest.send.and.returnValue(Promise.reject(error));

      spyOn(Log, 'error');

      config.register()
          .then(() => {
            expect(Log.error).toHaveBeenCalledWith(
                jasmine.any(Log),
                jasmine.stringMatching(/Failed to register/));
            done();
          }, done.fail);
    });

    it('should handle the case with no CSS URLs', (done: any) => {
      config = new ComponentConfig(
          mockInjector,
          TestComponent,
          TAG,
          TEMPLATE_URL,
          mockXtag,
          []);
      TestDispose.add(config);

      let templateContent = 'templateContent';
      let mockTemplateRequest = jasmine.createSpyObj('TemplateRequest', ['send']);
      mockTemplateRequest.send.and.returnValue(Promise.resolve(templateContent));

      spyOn(Http, 'get').and.returnValue(mockTemplateRequest);

      let mockLifecycleConfig = Mocks.object('LifecycleConfig');
      spyOn(config, 'getLifecycleConfig_').and.returnValue(mockLifecycleConfig);

      config.register()
          .then(() => {
            expect(config['getLifecycleConfig_']).toHaveBeenCalledWith(templateContent);
            done();
          }, done.fail);
    });
  });

  describe('runOnInstance_', () => {
    it('should call the instance correctly', () => {
      let mockCallback = jasmine.createSpy('Callback');
      let mockElement = Mocks.object('Element');
      let mockInstance = new TestComponent();
      TestDispose.add(mockInstance);

      mockElement[ComponentConfig['__instance']] = mockInstance;

      ComponentConfig['runOnInstance_'](mockElement, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(mockInstance);
    });

    it('should throw error if the instance is not an instance of BaseComponent', () => {
      let mockCallback = jasmine.createSpy('Callback');
      let mockElement = Mocks.object('Element');
      let mockInstance = Mocks.object('Instance');

      mockElement[ComponentConfig['__instance']] = mockInstance;

      expect(() => {
        ComponentConfig['runOnInstance_'](mockElement, mockCallback);
      }).toThrowError(/Cannot find valid instance/);
    });
  });
});

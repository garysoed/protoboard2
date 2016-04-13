import TestBase from '../test-base';
TestBase.setup();

import BaseComponent from './base-component';
import ComponentConfig from './component-config';
import Http from '../../node_modules/gs-tools/src/net/http';
import Log from '../../node_modules/gs-tools/src/log';
import Mocks from '../../node_modules/gs-tools/src/mock/mocks';
import Reflect from '../../node_modules/gs-tools/src/reflect';


describe('component.ComponentConfig', () => {
  const TAG = 'tag';
  const TEMPLATE_URL = 'template url';

  let mockXtag;
  let config;

  class TestComponent extends BaseComponent { }

  beforeEach(() => {
    mockXtag = jasmine.createSpyObj('Xtag', ['register']);
    config = new ComponentConfig(TestComponent, TAG, TEMPLATE_URL, mockXtag);
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
      mockElement.createShadowRoot.and.returnValue(mockShadowRoot);

      spyOn(TestComponent.prototype, 'onCreated');

      config['getLifecycleConfig_'](content).created.call(mockElement);

      expect(mockElement[ComponentConfig['__instance']]).toEqual(jasmine.any(TestComponent));
      expect(mockElement[ComponentConfig['__instance']].onCreated).toHaveBeenCalledWith();
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
    let mockHttpRequest;

    beforeEach(() => {
      mockHttpRequest = jasmine.createSpyObj('HttpRequest', ['send']);
      spyOn(Http, 'get').and.returnValue(mockHttpRequest);
    });

    it('should return promise that registers the element correctly', (done: any) => {
      let templateContent = 'templateContent';
      mockHttpRequest.send.and.returnValue(Promise.resolve(templateContent));

      let mockLifecycleConfig = Mocks.object('LifecycleConfig');
      spyOn(config, 'getLifecycleConfig_').and.returnValue(mockLifecycleConfig);

      config.register()
          .then(() => {
            expect(mockXtag.register).toHaveBeenCalledWith(
                TAG,
                {
                  lifecycle: mockLifecycleConfig,
                });
            expect(config['getLifecycleConfig_']).toHaveBeenCalledWith(templateContent);
            done();
          }, done.fail);
    });

    it('should log error if the template URL failed to load', (done: any) => {
      let error = 'error';
      mockHttpRequest.send.and.returnValue(Promise.reject(error));

      spyOn(Log, 'error');

      config.register()
          .then(() => {
            expect(Log.error).toHaveBeenCalledWith(
                jasmine.any(Log),
                jasmine.stringMatching(/Failed to register/));
            done();
          }, done.fail);
    });
  });

  describe('runOnInstance_', () => {
    it('should call the instance correctly', () => {
      let mockCallback = jasmine.createSpy('Callback');
      let mockElement = Mocks.object('Element');
      let mockInstance = new TestComponent();

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

import TestBase from '../test-base';
TestBase.setup();

import {Bootstrap} from './bootstrap';
import {Element} from '../util/a-element';
import {ElementConfig} from '../../node_modules/gs-tools/src/webc/element-config';
import {ElementRegistrar} from '../../node_modules/gs-tools/src/webc/element-registrar';
import Game from './game';
import Injector from '../../node_modules/gs-tools/src/inject/injector';
import Mocks from '../../node_modules/gs-tools/src/mock/mocks';


describe('game.Bootstrap', () => {
  describe('getElementConfig_', () => {
    it('should create the element config correctly', () => {
      class TestClass {};

      let cssUrl = 'cssUrl';
      let tag = 'tag';
      let templateUrl = 'templateUrl';
      let mockDependency1 = Mocks.object('Dependency1');
      let mockDependency2 = Mocks.object('Dependency2');
      let mockElementConfig1 = Mocks.object('ElementConfig1');
      let mockElementConfig2 = Mocks.object('ElementConfig2');

      let mockInstance = Mocks.object('Instance');
      let mockInjector = jasmine.createSpyObj('Injector', ['instantiate']);
      mockInjector.instantiate.and.returnValue(mockInstance);

      let originalGetElementConfig_ = Bootstrap['getElementConfig_'].bind(Bootstrap);
      spyOn(Bootstrap, 'getElementConfig_').and.callFake((dependency: any, injector: any) => {
        switch (dependency) {
          case mockDependency1:
            return mockElementConfig1;
          case mockDependency2:
            return mockElementConfig2;
          default:
            return originalGetElementConfig_(dependency, injector);
        }
      });

      let mockElementConfig = Mocks.object('ElementConfig');
      let elementConfigNewInstanceSpy =
          spyOn(ElementConfig, 'newInstance').and.returnValue(mockElementConfig);

      spyOn(Element, 'getConfig').and.returnValue({
        cssUrl: cssUrl,
        dependencies: [mockDependency1, mockDependency2],
        tag: tag,
        templateUrl: templateUrl,
      });

      expect(Bootstrap['getElementConfig_'](TestClass, mockInjector)).toEqual(mockElementConfig);
      expect(TestClass[Bootstrap['__ELEMENT_CONFIG']]).toEqual(mockElementConfig);

      expect(ElementConfig.newInstance).toHaveBeenCalledWith(
          jasmine.any(Function),
          tag,
          templateUrl,
          [mockElementConfig1, mockElementConfig2],
          cssUrl);
      expect(elementConfigNewInstanceSpy.calls.argsFor(0)[0]()).toEqual(mockInstance);
      expect(mockInjector.instantiate).toHaveBeenCalledWith(TestClass);

      expect(Bootstrap['getElementConfig_']).toHaveBeenCalledWith(mockDependency1, mockInjector);
      expect(Bootstrap['getElementConfig_']).toHaveBeenCalledWith(mockDependency2, mockInjector);
    });

    it('should cache the element config', () => {
      class TestClass {}

      let mockElementConfig = Mocks.object('ElementConfig');
      TestClass[Bootstrap['__ELEMENT_CONFIG']] = mockElementConfig;

      spyOn(ElementConfig, 'newInstance');

      expect(Bootstrap['getElementConfig_'](TestClass, Mocks.object('Injector')))
          .toEqual(mockElementConfig);
      expect(ElementConfig.newInstance).not.toHaveBeenCalled();
    });
  });

  describe('bootstrap', () => {
    it('should register all specified components', (done: any) => {
      let mockInjector = Mocks.object('Injector');
      spyOn(Injector, 'newInstance').and.returnValue(mockInjector);
      let bindProviderSpy = spyOn(Injector, 'bindProvider');

      let mockRegistrar = jasmine.createSpyObj('Registrar', ['register']);
      mockRegistrar.register.and.callFake(() => Promise.resolve());
      spyOn(ElementRegistrar, 'newInstance').and.returnValue(mockRegistrar);

      let mockElementCtor1 = Mocks.object('ElementCtor1');
      let mockElementCtor2 = Mocks.object('ElementCtor2');
      let gameConfig = {
        componentList: [mockElementCtor1, mockElementCtor2],
      };

      let mockElementConfig1 = Mocks.object('ElementConfig1');
      let mockElementConfig2 = Mocks.object('ElementConfig2');
      spyOn(Bootstrap, 'getElementConfig_').and.callFake((ctor: gs.ICtor<any>) => {
        switch (ctor) {
          case mockElementCtor1:
            return mockElementConfig1;
          case mockElementCtor2:
            return mockElementConfig2;
          default:
            return null;
        }
      });

      let mockRoot = Mocks.object('Root');

      Bootstrap.bootstrap(gameConfig, mockRoot)
          .then((game: Game) => {
            expect(game).toEqual(jasmine.any(Game));
            expect(mockRegistrar.register).toHaveBeenCalledWith(mockElementConfig1);
            expect(mockRegistrar.register).toHaveBeenCalledWith(mockElementConfig2);
            expect(Bootstrap['getElementConfig_'])
                .toHaveBeenCalledWith(mockElementCtor1, mockInjector);
            expect(Bootstrap['getElementConfig_'])
                .toHaveBeenCalledWith(mockElementCtor2, mockInjector);

            expect(Injector.bindProvider).toHaveBeenCalledWith(jasmine.any(Function), 'pb-root');
            expect(bindProviderSpy.calls.argsFor(0)[0]()).toEqual(mockRoot);
            done();
          }, done.fail);
    });
  });
});

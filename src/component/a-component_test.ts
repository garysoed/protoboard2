import TestBase from '../test-base';
TestBase.setup();

import BaseElement from '../util/base-element';
import Component from './a-component';
import ComponentConfig from './component-config';
import Injector from '../../node_modules/gs-tools/src/inject/injector';
import Mocks from '../../node_modules/gs-tools/src/mock/mocks';


describe('component.Component', () => {
  let mockXtag;

  beforeEach(() => {
    mockXtag = Mocks.object('Xtag');
    window['xtag'] = mockXtag;
  });

  it('should bind the constructor correctly', () => {
    class TestComponent extends BaseElement { }

    let tag = 'tag';
    let templateUrl = 'templateUrl';

    let dependency = Mocks.object('dependency');
    let dependencyTag = 'dependencyTag';
    spyOn(Component, 'getConfigName').and.returnValue(dependencyTag);

    let cssUrl = 'cssUrl';

    spyOn(Injector, 'bind');

    Component({
      cssUrl: cssUrl,
      dependencies: [dependency],
      tag: tag,
      templateUrl: templateUrl,
    })(TestComponent);

    expect(Injector.bind).toHaveBeenCalledWith(ComponentConfig, tag, {
      1: TestComponent,
      2: tag,
      3: templateUrl,
      4: mockXtag,
      5: [dependencyTag],
      6: cssUrl,
    });
    expect(Component.getConfigName(TestComponent)).toEqual(dependencyTag);
  });

  it('should throw exception if the constructor does not extend BaseElement', () => {
    class TestComponent { }

    expect(() => {
      Component({ tag: 'tag', templateUrl: 'templateUrl' })(TestComponent);
    }).toThrowError(/extend BaseElement/);
  });

  it('should throw error if the tag name is empty', () => {
    class TestComponent extends BaseElement { }

    expect(() => {
      Component({ tag: '', templateUrl: 'templateUrl'})(TestComponent);
    }).toThrowError(/non empty tag name/);
  });

  it('should throw error if the template URL is empty', () => {
    class TestComponent extends BaseElement { }

    expect(() => {
      Component({ tag: 'tag', templateUrl: ''})(TestComponent);
    }).toThrowError(/non empty template URL/);
  });

  it('should throw error if xtag is not defined', () => {
    class TestComponent extends BaseElement { }

    window['xtag'] = undefined;

    expect(() => {
      Component({ tag: 'tag', templateUrl: 'url'})(TestComponent);
    }).toThrowError(/xtag library not found/);

    window['xtag'] = mockXtag;
  });
});

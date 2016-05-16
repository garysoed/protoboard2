import TestBase from '../test-base';
TestBase.setup();

import {BaseElement} from '../../node_modules/gs-tools/src/webc/base-element';
import Component from './a-component';
import Mocks from '../../node_modules/gs-tools/src/mock/mocks';


describe('component.Component', () => {
  let mockXtag;

  beforeEach(() => {
    mockXtag = Mocks.object('Xtag');
    window['xtag'] = mockXtag;
  });

  it('should bind the constructor correctly', () => {
    class TestComponent extends BaseElement { }

    let config = {tag: 'tag', templateUrl: 'templateUrl'};

    Component(config)(TestComponent);
    expect(Component.getConfig(TestComponent)).toEqual(config);
  });

  it('should throw exception if the constructor does not extend BaseElement', () => {
    class TestComponent { }

    expect(() => {
      Component({tag: 'tag', templateUrl: 'templateUrl'})(TestComponent);
    }).toThrowError(/extend BaseElement/);
  });

  it('should throw error if the tag name is empty', () => {
    class TestComponent extends BaseElement { }

    expect(() => {
      Component({tag: '', templateUrl: 'templateUrl'})(TestComponent);
    }).toThrowError(/non empty tag name/);
  });

  it('should throw error if the template URL is empty', () => {
    class TestComponent extends BaseElement { }

    expect(() => {
      Component({tag: 'tag', templateUrl: ''})(TestComponent);
    }).toThrowError(/non empty template URL/);
  });
});

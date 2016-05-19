import TestBase from '../test-base';
TestBase.setup();

import {BaseElement} from '../../node_modules/gs-tools/src/webc/base-element';
import {Element} from './a-element';
import Mocks from '../../node_modules/gs-tools/src/mock/mocks';


describe('util.Element', () => {
  let mockXtag;

  beforeEach(() => {
    mockXtag = Mocks.object('Xtag');
    window['xtag'] = mockXtag;
  });

  it('should bind the constructor correctly', () => {
    class TestElement extends BaseElement { }

    let config = {tag: 'tag', templateUrl: 'templateUrl'};

    Element(config)(TestElement);
    expect(Element.getConfig(TestElement)).toEqual(config);
  });

  it('should throw exception if the constructor does not extend BaseElement', () => {
    class TestElement { }

    expect(() => {
      Element({tag: 'tag', templateUrl: 'templateUrl'})(TestElement);
    }).toThrowError(/extend BaseElement/);
  });

  it('should throw error if the tag name is empty', () => {
    class TestElement extends BaseElement { }

    expect(() => {
      Element({tag: '', templateUrl: 'templateUrl'})(TestElement);
    }).toThrowError(/non empty tag name/);
  });

  it('should throw error if the template URL is empty', () => {
    class TestElement extends BaseElement { }

    expect(() => {
      Element({tag: 'tag', templateUrl: ''})(TestElement);
    }).toThrowError(/non empty template URL/);
  });
});

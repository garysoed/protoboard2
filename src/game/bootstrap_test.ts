import TestBase from '../test-base';
TestBase.setup();

import bootstrap from './bootstrap';
import Game from './game';
import Mocks from '../../node_modules/gs-tools/src/mock/mocks';


describe('game.bootstrap', () => {
  it('should register all specified components', () => {
    let componentName1 = 'componentName1';
    let componentName2 = 'componentName2';
    let mockComponent1 = jasmine.createSpyObj('Component1', ['register']);
    let mockComponent2 = jasmine.createSpyObj('Component2', ['register']);

    let mockInjector = jasmine.createSpyObj('Injector', ['bindValue', 'getBoundValue']);
    mockInjector.getBoundValue.and.callFake((bindKey: string) => {
      switch (bindKey) {
        case componentName1:
          return mockComponent1;
        case componentName2:
          return mockComponent2;
        default:
          return null;
      }
    });
    let mockRoot = Mocks.object('Root');

    let game = bootstrap(
        {
          componentList: [componentName1, componentName2],
        },
        mockInjector,
        mockRoot);

    expect(game).toEqual(jasmine.any(Game));
    expect(mockInjector.getBoundValue).toHaveBeenCalledWith(componentName1);
    expect(mockInjector.getBoundValue).toHaveBeenCalledWith(componentName2);
    expect(mockComponent1.register).toHaveBeenCalledWith();
    expect(mockComponent2.register).toHaveBeenCalledWith();
    expect(mockInjector.bindValue).toHaveBeenCalledWith('pb-root', mockRoot);
  });
});

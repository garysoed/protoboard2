import TestBase from '../test-base';
TestBase.setup();

import ActionTarget from './action-target';
import ListenableElement, { EventType as DomEventType }
    from '../../node_modules/gs-tools/src/event/listenable-element';
import Mocks from '../../node_modules/gs-tools/src/mock/mocks';
import TestDispose from '../../node_modules/gs-tools/src/testing/test-dispose';


describe('component.ActionTarget', () => {
  let mockActionService;
  let target;

  beforeEach(() => {
    mockActionService = jasmine.createSpyObj('ActionService', ['addHandler', 'removeHandler']);
    target = new ActionTarget(mockActionService);
    TestDispose.add(target);
  });

  describe('onMouseEnter_', () => {
    it('should add the target to the action service', () => {
      target['onMouseEnter_']();
      expect(mockActionService.addHandler).toHaveBeenCalledWith(target);
    });
  });

  describe('onMouseLeave_', () => {
    it('should remove the target from the action service', () => {
      target['onMouseLeave_']();
      expect(mockActionService.removeHandler).toHaveBeenCalledWith(target);
    });
  });

  describe('onCreated', () => {
    it('should listen to mouse leave and mouse enter events', () => {
      let mockElement = Mocks.object('Element');
      let mockListenableElement = Mocks.listenable('ListenableElement');
      let listenableElementSpy = spyOn(mockListenableElement, 'on');
      listenableElementSpy.and.callThrough();

      spyOn(ListenableElement, 'of').and.returnValue(mockListenableElement);

      spyOn(target, 'onMouseLeave_');
      spyOn(target, 'onMouseEnter_');

      target.onCreated(mockElement);

      expect(mockListenableElement.on)
          .toHaveBeenCalledWith(DomEventType.MOUSEENTER, jasmine.any(Function));
      listenableElementSpy.calls
          .firstArgsMatching(DomEventType.MOUSEENTER, jasmine.any(Function))[1]();
      expect(target['onMouseEnter_']).toHaveBeenCalledWith();

      expect(mockListenableElement.on)
          .toHaveBeenCalledWith(DomEventType.MOUSELEAVE, jasmine.any(Function));
      listenableElementSpy.calls
          .firstArgsMatching(DomEventType.MOUSELEAVE, jasmine.any(Function))[1]();
      expect(target['onMouseLeave_']).toHaveBeenCalledWith();
    });
  });
});

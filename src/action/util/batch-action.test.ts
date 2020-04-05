import { assert, createSpy, run, should, Spy, test } from 'gs-testing';
import { _v } from 'mask';

import { BatchAction } from './batch-action';

interface ElementWithFunction {
  readonly element: HTMLElement;
  readonly spy: Spy<undefined, []>;
}

test('@protoboard2/action/util/batch-action', init => {
  const ACTION_KEY = 'action';

  test('trigger', () => {
    function createElementWithFunction(spyName: string): ElementWithFunction {
      const spy = createSpy<undefined, []>(spyName);
      const element = document.createElement('div');
      Object.assign(element, {[ACTION_KEY]: spy});

      return {element, spy};
    }

    should(`call the specified function on all the child elements`, () => {
      const rootEl = document.createElement('div');
      const {element: child1, spy: spy1} = createElementWithFunction('Function1');
      const {element: child2, spy: spy2} = createElementWithFunction('Function2');
      const {element: child3, spy: spy3} = createElementWithFunction('Function3');
      rootEl.appendChild(child1);
      rootEl.appendChild(child2);
      rootEl.appendChild(child3);

      const shadowRoot = rootEl.attachShadow({mode: 'open'});
      const vine = _v.build('test');
      const action = new BatchAction(ACTION_KEY, 'Batch test', vine);
      action.setActionTarget(shadowRoot);
      run(action.run());

      action.trigger();

      assert(spy1).to.haveBeenCalledWith();
      assert(spy2).to.haveBeenCalledWith();
      assert(spy3).to.haveBeenCalledWith();
    });

    should(`skip elements without the specified function`, () => {
      const rootEl = document.createElement('div');
      const {element: child1, spy: spy1} = createElementWithFunction('Function1');
      const child2 = document.createElement('div');
      const {element: child3, spy: spy3} = createElementWithFunction('Function1');
      rootEl.appendChild(child1);
      rootEl.appendChild(child2);
      rootEl.appendChild(child3);

      const shadowRoot = rootEl.attachShadow({mode: 'open'});
      const vine = _v.build('test');
      const action = new BatchAction(ACTION_KEY, 'Batch test', vine);
      action.setActionTarget(shadowRoot);
      run(action.run());

      action.trigger();

      assert(spy1).to.haveBeenCalledWith();
      assert(spy3).to.haveBeenCalledWith();
    });
  });
});

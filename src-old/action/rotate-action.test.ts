import { assert, run, runEnvironment, should, test } from 'gs-testing';
import { _v } from 'mask';
import { createFakeContext, PersonaTesterEnvironment } from 'persona/export/testing';

import { RotateAction } from './rotate-action';


interface TestState {
  readonly action: RotateAction;
  readonly el: HTMLElement;
}

test('@protoboard2/action/rotate-action', init => {
  function setupTest(index: number, stops: readonly number[]): TestState {
    const el = document.createElement('div');
    const vine = _v.build('test');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const action = new RotateAction(index, stops, vine);
    action.setActionContext(createFakeContext({shadowRoot}));
    run(action.run());

    return {action, el};
  }

  init(() => {
    runEnvironment(new PersonaTesterEnvironment());
    return {};
  });

  test('onConfig', () => {
    should(`change the index when updated`, () => {
      const _ = setupTest(0, [1, 2, 3]);

      const configEl = document.createElement('pb-action-config');
      configEl.setAttribute('action', 'rotate');
      configEl.setAttribute('index', '2');
      _.el.appendChild(configEl);

      assert(_.el.style.transform).to.equal('rotateZ(3deg)');
    });

    should(`change the stops when updated`, () => {
      const _ = setupTest(1, []);

      const configEl = document.createElement('pb-action-config');
      configEl.setAttribute('action', 'rotate');
      configEl.setAttribute('stops', '[12 34 45]');
      _.el.appendChild(configEl);

      assert(_.el.style.transform).to.equal('rotateZ(34deg)');
    });
  });

  test('onTrigger', () => {
    should(`change the rotation`, () => {
      const _ = setupTest(1, [11, 22, 33]);

      _.action.trigger();

      assert(_.el.style.transform).to.equal('rotateZ(33deg)');
    });
  });

  test('setupHandleNewIndex', () => {
    should(`should handle cycling`, () => {
      const _ = setupTest(2, [11, 22, 33]);

      _.action.trigger();

      assert(_.el.style.transform).to.equal('rotateZ(11deg)');
    });
  });
});

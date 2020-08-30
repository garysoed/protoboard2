import { assert, run, runEnvironment, should, test } from 'gs-testing';
import { createFakeContext, PersonaTesterEnvironment } from 'persona/export/testing';
import { of as observableOf, ReplaySubject, Subject } from 'rxjs';

import { RotateAction } from './rotate-action';
import { createFakeActionContext } from './testing/fake-action-context';


interface TestState {
  readonly action: RotateAction;
  readonly el: HTMLElement;
  readonly rotationIndex$: Subject<number>;
}

test('@protoboard2/action/rotate-action', init => {
  function setupTest(stops: readonly number[]): TestState {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const personaContext = createFakeContext({shadowRoot});
    const rotationIndex$ = new ReplaySubject<number>(1);
    const state$ = {
      id: 'objectId',
      type: 'objectType',
      payload: {rotationIndex: rotationIndex$},
    };
    const action = new RotateAction(
        createFakeActionContext({
          host$: observableOf(el),
          personaContext,
          state$: observableOf(state$),
        }),
        {stops},
    );
    run(action.run());

    return {action, el, rotationIndex$};
  }

  init(() => {
    runEnvironment(new PersonaTesterEnvironment());
    return {};
  });

  test('handleTrigger', () => {
    should(`change the rotation`, () => {
      const _ = setupTest([11, 22, 33]);
      _.rotationIndex$.next(1);

      _.action.trigger();

      assert(_.el.style.transform).to.equal('rotateZ(33deg)');
    });
  });

  test('renderIndex', () => {
    should(`change the stops when updated`, () => {
      const _ = setupTest([]);
      _.rotationIndex$.next(1);

      const configEl = document.createElement('pb-action-config');
      configEl.setAttribute('action', 'rotate');
      configEl.setAttribute('stops', '[12 34 45]');
      _.el.appendChild(configEl);

      assert(_.el.style.transform).to.equal('rotateZ(34deg)');
    });
  });
});

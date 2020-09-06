import { assert, createSpySubject, run, runEnvironment, should, test } from 'gs-testing';
import { _v } from 'mask';
import { createFakeContext, PersonaTesterEnvironment } from 'persona/export/testing';
import { of as observableOf, ReplaySubject } from 'rxjs';

import { createFakeActionContext } from './testing/fake-action-context';
import { TurnAction } from './turn-action';


test('@protoboard2/action/turn-action', init => {
  const _ = init(() => {
    runEnvironment(new PersonaTesterEnvironment());

    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const personaContext = createFakeContext({shadowRoot});
    const faceIndex$ = new ReplaySubject<number>(1);
    const state$ = {
      id: 'objectId',
      type: 'objectType',
      payload: {faceIndex: faceIndex$},
    };

    const action = new TurnAction(
        createFakeActionContext({
          host$: observableOf(el),
          personaContext,
          state$: observableOf(state$),
        }),
        {count: 2},
    );

    run(action.run());

    return {action, personaContext, el, faceIndex$};
  });

  test('handleTrigger', () => {
    should(`increase the face by 1`, () => {
      _.faceIndex$.next(0);

      _.action.trigger();

      assert(_.faceIndex$).to.emitWith(1);
    });

    should(`wrap the face index by the count`, () => {
      _.faceIndex$.next(1);

      const faceIndex$ = createSpySubject(_.faceIndex$);

      _.action.trigger();
      _.action.trigger();

      assert(faceIndex$).to.emitSequence([1, 0, 1]);
    });

    should(`use the config object`, () => {
      _.faceIndex$.next(1);

      _.el.setAttribute('pb-turn-count', '4');

      const faceIndex$ = createSpySubject(_.faceIndex$);

      _.action.trigger();
      _.action.trigger();

      assert(faceIndex$).to.emitSequence([1, 2, 3]);
    });
  });
});

import { arrayThat, assert, run, should, test } from 'gs-testing';
import { FakeSeed, fromSeed } from 'gs-tools/export/random';
import { _v } from 'mask';
import { createFakeContext } from 'persona/export/testing';
import { BehaviorSubject, ReplaySubject } from 'rxjs';

import { ObjectSpec } from '../state-old/object-spec';

import { DroppablePayload } from './payload/droppable-payload';
import { ShuffleAction } from './shuffle-action';
import { createFakeActionContext } from './testing/fake-action-context';
import { $random } from './util/random';


test('@protoboard2/action/shuffle-action', () => {
  should(`shuffle the child elements correctly`, () => {
    const rootEl = document.createElement('div');
    const shadowRoot = rootEl.attachShadow({mode: 'open'});
    const personaContext = createFakeContext({shadowRoot});
    const state$ = new ReplaySubject<ObjectSpec<DroppablePayload>>(1);

    const action = new ShuffleAction(createFakeActionContext({
      personaContext,
      state$,
    }));

    const id1 = 'id1';
    const id2 = 'id2';
    const id3 = 'id3';
    const contentIds$ = new BehaviorSubject<readonly string[]>([id1, id2, id3]);
    state$.next({
      id: 'id',
      type: 'test',
      payload: {contentIds: contentIds$},
    });

    const seed = new FakeSeed([1, 0, 0.5]);
    $random.set(personaContext.vine, () => fromSeed(seed));
    run(action.run());

    action.trigger();

    assert(contentIds$).to.emitWith(arrayThat<string>().haveExactElements([id2, id3, id1]));
  });
});

import { arrayThat, assert, createSpySubject, run, should, test } from 'gs-testing';
import { createFakeContext } from 'persona/export/testing';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ACTIVE_ID, ACTIVE_TYPE, ActivePayload } from '../region/active';
import { State } from '../state/state';
import { createFakeStateService } from '../state/testing/fake-state-service';

import { DropAction } from './drop-action';
import { DroppablePayload } from './payload/droppable-payload';
import { createFakeActionContext } from './testing/fake-action-context';


test('@protoboard2/action/drop-action', init => {
  const OTHER_ACTIVE_ID = 'otherActiveId';
  const OTHER_TARGET_ID = 'otherTargetId';
  const MOVED_ID = 'movedId';

  const _ = init(() => {
    const el = document.createElement('div');

    const shadowRoot = el.attachShadow({mode: 'open'});
    const personaContext = createFakeContext({shadowRoot});
    const state$ = new ReplaySubject<State<DroppablePayload>>(1);
    const action = new DropAction(
        createFakeActionContext({personaContext, state$}),
        {location: 0},
    );

    const fakeStateService = createFakeStateService(personaContext.vine);
    const activeState = {
      id: ACTIVE_ID,
      type: ACTIVE_TYPE,
      payload: {contentIds: [OTHER_ACTIVE_ID, MOVED_ID]},
    };
    fakeStateService.setStates(new Set([
      activeState,
      {id: MOVED_ID, type: 'movedType', payload: {parentId: ACTIVE_ID}},
    ]));

    run(action.run());

    return {action, el, fakeStateService, personaContext, state$};
  });

  test('onTrigger', () => {
    should(`trigger correctly`, () => {
      const objectId = 'objectId';
      const state = {
        id: objectId,
        type: 'objectType',
        payload: {contentIds: new BehaviorSubject<readonly string[]>([OTHER_TARGET_ID])},
      };
      _.state$.next(state);

      const activeIds$ = createSpySubject(
          _.fakeStateService.getState<ActivePayload>(ACTIVE_ID).pipe(
              switchMap(state => state!.payload.contentIds),
          ),
      );
      const targetIds$ = createSpySubject(
          _.state$.pipe(switchMap(state => state.payload.contentIds)),
      );

      _.action.trigger();

      assert(activeIds$).to.emitSequence([
        arrayThat<string>().haveExactElements([OTHER_ACTIVE_ID, MOVED_ID]),
        arrayThat<string>().haveExactElements([OTHER_ACTIVE_ID]),
      ]);

      assert(targetIds$).to.emitSequence([
        arrayThat<string>().haveExactElements([OTHER_TARGET_ID]),
        arrayThat<string>().haveExactElements([MOVED_ID, OTHER_TARGET_ID]),
      ]);
    });
  });
});

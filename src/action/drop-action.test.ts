import { arrayThat, assert, createSpySubject, run, should, test } from 'gs-testing';
import { debug } from 'gs-tools/export/rxjs';
import { createFakeContext } from 'persona/export/testing';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ACTIVE_ID, ActivePayload, createActiveState } from '../region/active';
import { State } from '../state/state';
import { $stateService } from '../state/state-service';
import { createFakeStateService } from '../state/testing/fake-state-service';

import { DropAction, DroppablePayload } from './drop-action';


test('@protoboard2/action/drop-action', init => {
  const OTHER_ACTIVE_ID = 'otherActiveId';
  const OTHER_TARGET_ID = 'otherTargetId';
  const MOVED_ID = 'movedId';

  const _ = init(() => {
    const el = document.createElement('div');

    const shadowRoot = el.attachShadow({mode: 'open'});
    const personaContext = createFakeContext({shadowRoot});
    const objectId$ = new ReplaySubject<string>(1);
    const state$ = new ReplaySubject<State<DroppablePayload>>(1);
    const action = new DropAction({
      personaContext,
      objectId$,
      state$,
    });

    const fakeStateService = createFakeStateService(personaContext.vine);
    const activeState = createActiveState([OTHER_ACTIVE_ID, MOVED_ID]);
    fakeStateService.setStates(new Set([activeState]));

    run(action.run());

    return {action, el, fakeStateService, personaContext, objectId$, state$};
  });

  test('onTrigger', () => {
    should(`trigger correctly`, () => {
      const objectId = 'objectId';
      _.objectId$.next(objectId);

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
        arrayThat<string>().haveExactElements([OTHER_TARGET_ID, MOVED_ID]),
      ]);
    });
  });
});

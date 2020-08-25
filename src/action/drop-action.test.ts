import { arrayThat, assert, createSpySubject, run, should, test } from 'gs-testing';
import { createFakeContext } from 'persona/export/testing';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { ACTIVE_ID, ActivePayload, createActiveState } from '../region/active';
import { State } from '../state/state';
import { $stateService, setStates } from '../state/state-service';

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

    const activeState = createActiveState([OTHER_ACTIVE_ID, MOVED_ID]);
    setStates(new Set([activeState]), personaContext.vine);

    run(action.run());

    return {action, el, personaContext, objectId$, state$};
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
          $stateService.get(_.personaContext.vine).pipe(
              switchMap(service => {
                return service.getState<ActivePayload>(ACTIVE_ID)!.payload.contentIds;
              }),
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

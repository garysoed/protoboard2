import { arrayThat, assert, createSpySubject, run, should, test } from 'gs-testing';
import { createFakeContext } from 'persona/export/testing';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ACTIVE_ID, ACTIVE_TYPE, ActivePayload } from '../region/active';
import { State } from '../state/state';
import { $stateService } from '../state/state-service';
import { createFakeStateService } from '../state/testing/fake-state-service';

import { DroppablePayload } from './payload/droppable-payload';
import { PickAction } from './pick-action';
import { createFakeActionContext } from './testing/fake-action-context';


test('@protoboard2/action/pick-action', init => {
  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const personaContext = createFakeContext({shadowRoot});
    const state$ = new ReplaySubject<State<DroppablePayload>>(1);
    const action = new PickAction(
        createFakeActionContext({
          personaContext,
          state$,
        }),
        {location: 1},
    );

    const fakeStateService = createFakeStateService(personaContext.vine);
    run(action.run());

    return {action, fakeStateService, personaContext, el, state$};
  });

  test('onTrigger', () => {
    should(`trigger correctly`, () => {
      const movedId = 'movedId';
      const otherId1 = 'otherId1';
      const otherId2 = 'otherId2';
      const contentIds$ = new BehaviorSubject<readonly string[]>([otherId1, movedId, otherId2]);

      const otherActiveId = 'otherActiveId';
      const activeState = {
        id: ACTIVE_ID,
        type: ACTIVE_TYPE,
        payload: {contentIds: [otherActiveId]},
      };
      _.fakeStateService.setStates(new Set([activeState]));

      _.state$.next({
        id: 'objectId',
        type: 'movedType',
        payload: {contentIds: contentIds$},
      });

      const activeIds$ = createSpySubject(
          $stateService.get(_.personaContext.vine)
              .pipe(
                  switchMap(service => service.getState<ActivePayload>(ACTIVE_ID)),
                  switchMap(state => state!.payload.contentIds),
              ),
      );

      _.action.trigger();

      assert(activeIds$).to.emitSequence([
        arrayThat<string>().haveExactElements([otherActiveId]),
        arrayThat<string>().haveExactElements([otherActiveId, movedId]),
      ]);
      assert(contentIds$).to.emitSequence([
        arrayThat<string>().haveExactElements([otherId1, otherId2]),
      ]);
    });
  });
});

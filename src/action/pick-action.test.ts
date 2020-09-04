import { arrayThat, assert, createSpySubject, run, should, test } from 'gs-testing';
import { createFakeContext } from 'persona/export/testing';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ACTIVE_ID, ACTIVE_TYPE, ActivePayload } from '../region/active';
import { State } from '../state/state';
import { $stateService } from '../state/state-service';
import { createFakeStateService } from '../state/testing/fake-state-service';

import { MovablePayload } from './payload/movable-payload';
import { PickAction } from './pick-action';
import { createFakeActionContext } from './testing/fake-action-context';


test('@protoboard2/action/pick-action', init => {
  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const personaContext = createFakeContext({shadowRoot});
    const state$ = new ReplaySubject<State<MovablePayload>>(1);
    const action = new PickAction(createFakeActionContext({
      personaContext,
      state$,
    }));

    const fakeStateService = createFakeStateService(personaContext.vine);
    const activeState = {id: ACTIVE_ID, type: ACTIVE_TYPE, payload: {contentIds: []}};
    fakeStateService.setStates(new Set([activeState]));
    run(action.run());

    return {action, fakeStateService, personaContext, el, state$};
  });

  test('onTrigger', () => {
    should(`trigger correctly`, () => {
      const objectId = 'objectId';

      _.state$.next({
        id: objectId,
        type: 'movedType',
        payload: {parentId: new BehaviorSubject<string|null>(null)},
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
        arrayThat<string>().beEmpty(),
        arrayThat<string>().haveExactElements([objectId]),
      ]);
    });
  });
});

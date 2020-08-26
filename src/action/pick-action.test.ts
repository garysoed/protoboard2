import { arrayThat, assert, createSpySubject, run, should, test } from 'gs-testing';
import { createFakeContext } from 'persona/export/testing';
import { ReplaySubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ACTIVE_ID, ActivePayload, createActiveState } from '../region/active';
import { State } from '../state/state';
import { $stateService } from '../state/state-service';
import { createFakeStateService } from '../state/testing/fake-state-service';

import { PickAction } from './pick-action';


test('@protoboard2/action/pick-action', init => {
  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const personaContext = createFakeContext({shadowRoot});
    const objectId$ = new ReplaySubject<string>(1);
    const state$ = new ReplaySubject<State<{}>>(1);
    const action = new PickAction({
      personaContext,
      objectId$,
      state$,
    });

    const fakeStateService = createFakeStateService(personaContext.vine);
    const activeState = createActiveState([]);
    fakeStateService.setStates(new Set([activeState]));
    run(action.run());

    return {action, objectId$, personaContext, el};
  });

  test('onTrigger', () => {
    should(`trigger correctly`, () => {
      const objectId = 'objectId';
      _.objectId$.next(objectId);
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

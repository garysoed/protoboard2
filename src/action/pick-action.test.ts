import { arrayThat, assert, createSpySubject, run, should, test } from 'gs-testing';
import { _v } from 'mask';
import { createFakeContext } from 'persona/export/testing';
import { map, switchMap } from 'rxjs/operators';

import { ACTIVE_ID, ActivePayload, createActiveState } from '../region/active';
import { $stateService, setStates } from '../state/state-service';

import { PickAction } from './pick-action';


test('@protoboard2/action/pick-action', init => {
  const OBJECT_ID = 'objectId';

  const _ = init(() => {
    const el = document.createElement('div');
    el.setAttribute('object-id', OBJECT_ID);

    const shadowRoot = el.attachShadow({mode: 'open'});
    const context = createFakeContext({shadowRoot});
    const action = new PickAction(context);

    const activeState = createActiveState([]);
    setStates([activeState], context.vine);
    run(action.run());

    return {action, context, el};
  });

  test('onTrigger', () => {
    should(`trigger correctly`, () => {
      const activeIds$ = createSpySubject(
          $stateService.get(_.context.vine)
              .pipe(
                  switchMap(service => {
                    return service.getState<ActivePayload>(ACTIVE_ID)!.payload.contentIds;
                  }),
              ),
      );

      _.action.trigger();

      assert(activeIds$).to.emitSequence([
        arrayThat<string>().beEmpty(),
        arrayThat<string>().haveExactElements([OBJECT_ID]),
      ]);
    });
  });
});

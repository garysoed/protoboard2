import { arrayThat, assert, createSpySubject, run, should, test } from 'gs-testing';
import { createFakeContext } from 'persona/export/testing';
import { switchMap } from 'rxjs/operators';

import { ACTIVE_ID, ActivePayload, createActiveState } from '../region/active';
import { $stateService, setStates } from '../state/state-service';

import { DropAction, DroppablePayload } from './drop-action';


test('@protoboard2/action/drop-action', init => {
  const OTHER_ACTIVE_ID = 'otherActiveId';
  const OTHER_TARGET_ID = 'otherTargetId';
  const MOVED_ID = 'movedId';
  const TARGET_ID = 'targetId';
  const TARGET_TYPE = 'targetType';

  const _ = init(() => {
    const el = document.createElement('div');
    el.setAttribute('object-id', TARGET_ID);

    const shadowRoot = el.attachShadow({mode: 'open'});
    const context = createFakeContext({shadowRoot});
    const action = new DropAction(context);

    const activeState = createActiveState([OTHER_ACTIVE_ID, MOVED_ID]);
    const targetState = {
      id: TARGET_ID,
      type: TARGET_TYPE,
      payload: {contentIds: [OTHER_TARGET_ID]},
    };
    setStates([activeState, targetState], context.vine);

    run(action.run());

    return {action, context, el};
  });

  test('onTrigger', () => {
    should(`trigger correctly`, () => {
      const activeIds$ = createSpySubject(
          $stateService.get(_.context.vine).pipe(
              switchMap(service => {
                return service.getState<ActivePayload>(ACTIVE_ID)!.payload.contentIds;
              }),
          ),
      );
      const targetIds$ = createSpySubject(
          $stateService.get(_.context.vine).pipe(
              switchMap(service => {
                return service.getState<DroppablePayload>(TARGET_ID)!.payload.contentIds;
              }),
          ),
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

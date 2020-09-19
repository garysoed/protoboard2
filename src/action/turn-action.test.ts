import { assert, createSpySubject, run, runEnvironment, should, test } from 'gs-testing';
import { StateService } from 'gs-tools/export/state';
import { $stateService } from 'mask';
import { createFakeContext, PersonaTesterEnvironment } from 'persona/export/testing';
import { of as observableOf } from 'rxjs';

import { fakeObjectSpecListBuilder } from '../objects/testing/fake-object-spec-list-builder';

import { IsMultifaced } from './payload/is-multifaced';
import { createFakeActionContext } from './testing/fake-action-context';
import { TurnAction } from './turn-action';


test('@protoboard2/action/turn-action', init => {
  const TARGET_ID = 'TARGET_ID';

  const _ = init(() => {
    runEnvironment(new PersonaTesterEnvironment());

    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const personaContext = createFakeContext({shadowRoot});

    const stateService = new StateService();
    $stateService.set(personaContext.vine, () => stateService);

    const builder = fakeObjectSpecListBuilder();
    const $faceIndex = stateService.add(2);
    builder.add<IsMultifaced>({id: TARGET_ID, payload: {$currentFaceIndex: $faceIndex}});

    builder.build(stateService, personaContext.vine);

    const action = new TurnAction(
        createFakeActionContext({
          personaContext,
          objectId$: observableOf(TARGET_ID),
        }),
        {count: 2},
    );

    run(action.run());

    return {$faceIndex, action, el, personaContext, stateService};
  });

  test('handleTrigger', () => {
    should(`increase the face by 1`, () => {
      _.stateService.set(_.$faceIndex, 0);

      _.action.trigger();

      assert(_.stateService.get(_.$faceIndex)).to.emitWith(1);
    });

    should(`wrap the face index by the count`, () => {
      _.stateService.set(_.$faceIndex, 1);

      const faceIndex$ = createSpySubject(_.stateService.get(_.$faceIndex));

      _.action.trigger();
      _.action.trigger();

      assert(faceIndex$).to.emitSequence([1, 0, 1]);
    });

    should(`use the config object`, () => {
      _.stateService.set(_.$faceIndex, 1);

      _.el.setAttribute('pb-turn-count', '4');

      const faceIndex$ = createSpySubject(_.stateService.get(_.$faceIndex));

      _.action.trigger();
      _.action.trigger();

      assert(faceIndex$).to.emitSequence([1, 2, 3]);
    });
  });
});

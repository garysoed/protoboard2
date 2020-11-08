import { $stateService } from 'mask';
import { PersonaTesterEnvironment, createFakeContext } from 'persona/export/testing';
import { StateService } from 'gs-tools/export/state';
import { assert, createSpySubject, run, runEnvironment, should, test } from 'gs-testing';
import { of as observableOf } from 'rxjs';

import { IsMultifaced } from '../payload/is-multifaced';
import { FakeRootStateBuilder } from '../objects/testing/fake-object-spec-list-builder';

import { TurnAction } from './turn-action';
import { createFakeActionContext } from './testing/fake-action-context';


test('@protoboard2/action/turn-action', init => {
  const _ = init(() => {
    runEnvironment(new PersonaTesterEnvironment());

    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const personaContext = createFakeContext({shadowRoot});

    const stateService = new StateService();
    $stateService.set(personaContext.vine, () => stateService);

    const builder = new FakeRootStateBuilder({});
    const $faceIndex = stateService.add(2);
    const objectSpec = builder.add<IsMultifaced>({
      id: 'TARGET_ID',
      payload: {$currentFaceIndex: $faceIndex},
    });

    builder.build(stateService, personaContext.vine);

    const action = new TurnAction(
        createFakeActionContext({
          personaContext,
          objectSpec$: observableOf(objectSpec),
        }),
        {count: 2},
    );

    run(action.run());

    return {$faceIndex, action, el, personaContext, stateService};
  });

  test('handleTrigger', () => {
    should('increase the face by 1', () => {
      _.stateService.set(_.$faceIndex, 0);

      _.action.trigger({mouseX: 0, mouseY: 0});

      assert(_.stateService.get(_.$faceIndex)).to.emitWith(1);
    });

    should('wrap the face index by the count', () => {
      _.stateService.set(_.$faceIndex, 1);

      const faceIndex$ = createSpySubject(_.stateService.get(_.$faceIndex));

      _.action.trigger({mouseX: 0, mouseY: 0});
      _.action.trigger({mouseX: 0, mouseY: 0});

      assert(faceIndex$).to.emitSequence([1, 0, 1]);
    });

    should('use the config object', () => {
      _.stateService.set(_.$faceIndex, 1);

      _.el.setAttribute('pb-turn-count', '4');

      const faceIndex$ = createSpySubject(_.stateService.get(_.$faceIndex));

      _.action.trigger({mouseX: 0, mouseY: 0});
      _.action.trigger({mouseX: 0, mouseY: 0});

      assert(faceIndex$).to.emitSequence([1, 2, 3]);
    });
  });
});

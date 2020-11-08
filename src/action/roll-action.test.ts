import { $stateService } from 'mask';
import { FakeSeed, fromSeed } from 'gs-tools/export/random';
import { PersonaTesterEnvironment, createFakeContext } from 'persona/export/testing';
import { StateService } from 'gs-tools/export/state';
import { assert, run, runEnvironment, should, test } from 'gs-testing';
import { of as observableOf } from 'rxjs';

import { IsMultifaced } from '../payload/is-multifaced';
import { FakeRootStateBuilder } from '../objects/testing/fake-object-spec-list-builder';

import { $random } from './util/random';
import { RollAction } from './roll-action';
import { createFakeActionContext } from './testing/fake-action-context';


test('@protoboard2/action/roll-action', init => {
  const _ = init(() => {
    runEnvironment(new PersonaTesterEnvironment());

    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const personaContext = createFakeContext({shadowRoot});

    const seed = new FakeSeed();
    $random.set(personaContext.vine, () => fromSeed(seed));

    const stateService = new StateService();
    $stateService.set(personaContext.vine, () => stateService);

    const builder = new FakeRootStateBuilder({});
    const $faceIndex = stateService.add(2);
    const objectSpec = builder.add<IsMultifaced>({
      id: 'TARGET_ID',
      payload: {$currentFaceIndex: $faceIndex},
    });
    builder.build(stateService, personaContext.vine);

    const action = new RollAction(
        createFakeActionContext({
          personaContext,
          objectSpec$: observableOf(objectSpec),
        }),
        {count: 3},
    );

    run(action.run());

    return {$faceIndex, action, el, seed, stateService};
  });

  test('handleTrigger', () => {
    should('change the current face correctly', () => {
      _.stateService.set(_.$faceIndex, 0);
      _.seed.values = [0.9];

      _.action.trigger({mouseX: 0, mouseY: 0});

      assert(_.stateService.get(_.$faceIndex)).to.emitWith(2);
    });

    should('use the config object', () => {
      _.stateService.set(_.$faceIndex, 0);

      _.el.setAttribute('pb-roll-count', '4');

      _.seed.values = [0.9];

      _.action.trigger({mouseX: 0, mouseY: 0});

      assert(_.stateService.get(_.$faceIndex)).to.emitWith(3);
    });
  });
});

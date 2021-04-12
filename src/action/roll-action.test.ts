import {assert, run, runEnvironment, should, test} from 'gs-testing';
import {FakeSeed, fromSeed} from 'gs-tools/export/random';
import {fakeStateService} from 'gs-tools/export/state';
import {$stateService} from 'mask';
import {createFakeContext, PersonaTesterEnvironment} from 'persona/export/testing';
import {of as observableOf} from 'rxjs';

import {fakePieceSpec} from '../objects/testing/fake-object-spec';

import {RollAction} from './roll-action';
import {createFakeActionContext} from './testing/fake-action-context';
import {$random} from './util/random';


test('@protoboard2/action/roll-action', init => {
  const _ = init(() => {
    runEnvironment(new PersonaTesterEnvironment());

    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const seed = new FakeSeed();
    const stateService = fakeStateService();

    const personaContext = createFakeContext({
      shadowRoot,
      overrides: [
        {override: $random, withValue: fromSeed(seed)},
        {override: $stateService, withValue: stateService},
      ],
    });

    const $faceIndex = stateService.modify(x => x.add(2));
    const objectId = stateService.modify(x => x.add(fakePieceSpec({
      payload: {$currentFaceIndex: $faceIndex},
    })));

    const action = new RollAction(
        createFakeActionContext({
          personaContext,
          objectId$: observableOf(objectId),
        }),
        {count: 3},
    );

    run(action.run());

    return {$faceIndex, action, el, seed, stateService};
  });

  test('handleTrigger', () => {
    should('change the current face correctly', () => {
      _.stateService.modify(x => x.set(_.$faceIndex, 0));
      _.seed.values = [0.9];

      _.action.trigger({mouseX: 0, mouseY: 0});

      assert(_.stateService.resolve(_.$faceIndex)).to.emitWith(2);
    });

    should('use the config object', () => {
      _.stateService.modify(x => x.set(_.$faceIndex, 0));

      _.el.setAttribute('pb-roll-count', '4');

      _.seed.values = [0.9];

      _.action.trigger({mouseX: 0, mouseY: 0});

      assert(_.stateService.resolve(_.$faceIndex)).to.emitWith(3);
    });
  });
});

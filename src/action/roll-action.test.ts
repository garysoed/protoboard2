import {$stateService} from 'grapevine';
import {assert, run, runEnvironment, should, test} from 'gs-testing';
import {FakeSeed, fromSeed} from 'gs-tools/export/random';
import {fakeStateService} from 'gs-tools/export/state';
import {host} from 'persona';
import {createFakeContext, PersonaTesterEnvironment} from 'persona/export/testing';
import {of} from 'rxjs';

import {TriggerType} from '../core/trigger-spec';

import {rollAction, rollActionConfigSpecs} from './roll-action';
import {triggerKey} from './testing/trigger-key';
import {compileConfig} from './util/compile-config';
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
    const objectId = stateService.modify(x => x.add({$currentFaceIndex: $faceIndex}));
    const action = rollAction(
        compileConfig(host(rollActionConfigSpecs({}))._, personaContext),
        of(objectId),
        personaContext,
    ).action;

    return {$faceIndex, action, el, seed, stateService};
  });

  test('handleTrigger', () => {
    should('change the current face correctly', () => {
      _.el.setAttribute('pb-roll-count', '3');
      _.stateService.modify(x => x.set(_.$faceIndex, 0));
      _.seed.values = [0.9];

      run(_.action());
      triggerKey(_.el, {key: TriggerType.L});

      assert(_.stateService.resolve(_.$faceIndex)).to.emitWith(2);
    });

    should('use the config object', () => {
      _.el.setAttribute('pb-roll-count', '3');
      _.stateService.modify(x => x.set(_.$faceIndex, 0));

      _.el.setAttribute('pb-roll-count', '4');
      _.seed.values = [0.9];

      run(_.action());
      triggerKey(_.el, {key: TriggerType.L});

      assert(_.stateService.resolve(_.$faceIndex)).to.emitWith(3);
    });
  });
});

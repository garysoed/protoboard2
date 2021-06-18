import {$stateService} from 'grapevine';
import {assert, createSpySubject, run, runEnvironment, should, test} from 'gs-testing';
import {fakeStateService} from 'gs-tools/export/state';
import {host} from 'persona';
import {createFakeContext, PersonaTesterEnvironment} from 'persona/export/testing';
import {of} from 'rxjs';

import {TriggerType} from '../core/trigger-spec';
import {IsMultifaced} from '../payload/is-multifaced';

import {flipAction, flipActionConfigSpecs} from './flip-action';
import {createFakeActionContext} from './testing/fake-action-context';
import {triggerKey} from './testing/trigger-key';
import {compileConfig} from './util/compile-config';


test('@protoboard2/action/flip-action', init => {
  const _ = init(() => {
    runEnvironment(new PersonaTesterEnvironment());

    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const stateService = fakeStateService();
    const personaContext = createFakeContext({
      shadowRoot,
      overrides: [
        {override: $stateService, withValue: stateService},
      ],
    });

    const $faceIndex = stateService.modify(x => x.add(2));
    const objectSpec = {$currentFaceIndex: $faceIndex};
    const objectId$ = of(stateService.modify(x => x.add(objectSpec)));

    const context = createFakeActionContext<IsMultifaced>({
      objectId$,
      personaContext,
    });
    const action = flipAction(
        compileConfig(host(flipActionConfigSpecs({}))._, personaContext),
        objectId$,
        personaContext,
    ).action;

    return {$faceIndex, action, context, el, personaContext, stateService};
  });

  test('handleTrigger', () => {
    should('increase the face by half the face count', () => {
      _.el.setAttribute('pb-flip-count', '4');
      _.stateService.modify(x => x.set(_.$faceIndex, 1));

      run(_.action(_.context));
      triggerKey(_.el, {key: TriggerType.F});

      assert(_.stateService.resolve(_.$faceIndex)).to.emitWith(3);
    });

    should('wrap the face index by the count', () => {
      _.el.setAttribute('pb-flip-count', '4');
      _.stateService.modify(x => x.set(_.$faceIndex, 1));

      const faceIndex$ = createSpySubject(_.stateService.resolve(_.$faceIndex));

      run(_.action(_.context));
      triggerKey(_.el, {key: TriggerType.F});
      triggerKey(_.el, {key: TriggerType.F});

      assert(faceIndex$).to.emitSequence([1, 3, 1]);
    });

    should('use the config object', () => {
      _.el.setAttribute('pb-flip-count', '4');
      _.stateService.modify(x => x.set(_.$faceIndex, 1));

      _.el.setAttribute('pb-flip-count', '6');
      const faceIndex$ = createSpySubject(_.stateService.resolve(_.$faceIndex));

      run(_.action(_.context));
      triggerKey(_.el, {key: TriggerType.F});
      triggerKey(_.el, {key: TriggerType.F});

      assert(faceIndex$).to.emitSequence([1, 4, 1]);
    });
  });
});

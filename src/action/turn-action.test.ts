import {$stateService} from 'grapevine';
import {assert, createSpySubject, run, runEnvironment, should, test} from 'gs-testing';
import {fakeStateService} from 'gs-tools/export/state';
import {host} from 'persona';
import {createFakeContext, PersonaTesterEnvironment} from 'persona/export/testing';
import {of} from 'rxjs';

import {TriggerType} from '../core/trigger-spec';
import {IsMultifaced} from '../payload/is-multifaced';

import {createFakeActionContext} from './testing/fake-action-context';
import {triggerKey} from './testing/trigger-key';
import {turnAction, turnActionConfigSpecs} from './turn-action';
import {compileConfig} from './util/compile-config';


test('@protoboard2/action/turn-action', init => {
  const _ = init(() => {
    runEnvironment(new PersonaTesterEnvironment());

    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const stateService = fakeStateService();
    const personaContext = createFakeContext({
      overrides: [
        {override: $stateService, withValue: stateService},
      ],
      shadowRoot,
    });

    const $faceIndex = stateService.modify(x => x.add(2));
    const objectId = stateService.modify(x => x.add({$currentFaceIndex: $faceIndex}));

    const context = createFakeActionContext<IsMultifaced>({
      objectId$: of(objectId),
      personaContext,
    });
    const action = turnAction(
        compileConfig(host(turnActionConfigSpecs({}))._, personaContext),
    ).action;

    return {$faceIndex, action, context, el, personaContext, stateService};
  });

  test('handleTrigger', () => {
    should('increase the face by 1', () => {
      _.el.setAttribute('pb-turn-count', '2');
      _.stateService.modify(x => x.set(_.$faceIndex, 0));

      run(_.action(_.context));
      triggerKey(_.el, {key: TriggerType.T});

      assert(_.stateService.resolve(_.$faceIndex)).to.emitWith(1);
    });

    should('wrap the face index by the count', () => {
      _.el.setAttribute('pb-turn-count', '2');
      _.stateService.modify(x => x.set(_.$faceIndex, 1));

      const faceIndex$ = createSpySubject(_.stateService.resolve(_.$faceIndex));

      run(_.action(_.context));
      triggerKey(_.el, {key: TriggerType.T});
      triggerKey(_.el, {key: TriggerType.T});

      assert(faceIndex$).to.emitSequence([1, 0, 1]);
    });

    should('use the config object', () => {
      _.el.setAttribute('pb-turn-count', '2');
      _.stateService.modify(x => x.set(_.$faceIndex, 1));

      _.el.setAttribute('pb-turn-count', '4');
      const faceIndex$ = createSpySubject(_.stateService.resolve(_.$faceIndex));

      run(_.action(_.context));
      triggerKey(_.el, {key: TriggerType.T});
      triggerKey(_.el, {key: TriggerType.T});

      assert(faceIndex$).to.emitSequence([1, 2, 3]);
    });
  });
});

import {$stateService} from 'grapevine';
import {assert, run, runEnvironment, should, test} from 'gs-testing';
import {fakeStateService} from 'gs-tools/export/state';
import {host} from 'persona';
import {createFakeContext, PersonaTesterEnvironment} from 'persona/export/testing';
import {of} from 'rxjs';

import {TriggerType} from '../core/trigger-spec';
import {IsRotatable} from '../payload/is-rotatable';

import {rotateAction, rotateActionConfigSpecs} from './rotate-action';
import {createFakeActionContext} from './testing/fake-action-context';
import {triggerKey} from './testing/trigger-key';
import {compileConfig} from './util/compile-config';


test('@protoboard2/action/rotate-action', init => {
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

    const $rotationDeg = stateService.modify(x => x.add(2));
    const objectId = stateService.modify(x => x.add({$rotationDeg}));

    const context = createFakeActionContext<IsRotatable>({
      objectId$: of(objectId),
      personaContext,
    });
    const action = rotateAction(
        compileConfig(host(rotateActionConfigSpecs({}))._, personaContext),
        personaContext,
    ).action;

    return {$rotationDeg, action, context, el, stateService};
  });

  test('handleTrigger$', () => {
    should('change the rotation to the next index', () => {
      _.el.setAttribute('pb-rotate-stops', '[\'11\' \'22\' \'33\']');
      _.stateService.modify(x => x.set(_.$rotationDeg, 1));

      run(_.action(_.context));
      triggerKey(_.el, {key: TriggerType.R});

      assert(_.stateService.resolve(_.$rotationDeg)).to.emitWith(22);
    });

    should('handle rotations that are more than 360', () => {
      _.el.setAttribute('pb-rotate-stops', '[\'123\' \'456\' \'678\']');
      _.stateService.modify(x => x.set(_.$rotationDeg, 910));

      run(_.action(_.context));
      triggerKey(_.el, {key: TriggerType.R});

      assert(_.stateService.resolve(_.$rotationDeg)).to.emitWith(456);
    });
  });
});

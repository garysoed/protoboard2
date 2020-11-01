import { $stateService } from 'mask';
import { PersonaTesterEnvironment, createFakeContext } from 'persona/export/testing';
import { StateService } from 'gs-tools/export/state';
import { assert, run, runEnvironment, should, test } from 'gs-testing';
import { of as observableOf } from 'rxjs';

import { IsRotatable } from '../payload/is-rotatable';
import { fakeObjectSpecListBuilder } from '../objects/testing/fake-object-spec-list-builder';

import { RotateAction } from './rotate-action';
import { createFakeActionContext } from './testing/fake-action-context';


test('@protoboard2/action/rotate-action', init => {
  const _ = init(() => {
    runEnvironment(new PersonaTesterEnvironment());

    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const personaContext = createFakeContext({shadowRoot});

    const stateService = new StateService();
    $stateService.set(personaContext.vine, () => stateService);

    const builder = fakeObjectSpecListBuilder();
    const $rotationDeg = stateService.add(2);
    const objectSpec = builder.add<IsRotatable>({id: 'TARGET_ID', payload: {$rotationDeg}});
    builder.build(stateService, personaContext.vine);

    const action = new RotateAction(
        createFakeActionContext({
          personaContext,
          objectSpec$: observableOf(objectSpec),
        }),
        {stops: [11, 22, 33]},
    );
    run(action.run());

    return {$rotationDeg, action, el, stateService};
  });

  test('handleTrigger$', () => {
    should('change the rotation to the next index', () => {
      _.stateService.set(_.$rotationDeg, 1);

      _.action.trigger({mouseX: 0, mouseY: 0});

      assert(_.stateService.get(_.$rotationDeg)).to.emitWith(22);
    });

    should('handle rotations that are more than 360', () => {
      _.el.setAttribute('pb-rotate-stops', '[123 456 678]');

      _.stateService.set(_.$rotationDeg, 910);

      _.action.trigger({mouseX: 0, mouseY: 0});

      assert(_.stateService.get(_.$rotationDeg)).to.emitWith(456);
    });
  });
});

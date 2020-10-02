import { assert, createSpySubject, run, runEnvironment, should, test } from 'gs-testing';
import { StateService } from 'gs-tools/export/state';
import { $stateService } from 'mask';
import { createFakeContext, PersonaTesterEnvironment } from 'persona/export/testing';
import { of as observableOf } from 'rxjs';

import { fakeObjectSpecListBuilder } from '../objects/testing/fake-object-spec-list-builder';

import { FlipAction } from './flip-action';
import { IsMultifaced } from '../payload/is-multifaced';
import { createFakeActionContext } from './testing/fake-action-context';


test('@protoboard2/action/flip-action', init => {
  const _ = init(() => {
    runEnvironment(new PersonaTesterEnvironment());

    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const personaContext = createFakeContext({shadowRoot});

    const stateService = new StateService();
    $stateService.set(personaContext.vine, () => stateService);

    const builder = fakeObjectSpecListBuilder();
    const $faceIndex = stateService.add(2);
    const objectSpec = builder.add<IsMultifaced>({
      id: 'TARGET_ID',
      payload: {$currentFaceIndex: $faceIndex},
    });
    builder.build(stateService, personaContext.vine);

    const action = new FlipAction(
        createFakeActionContext({
          personaContext,
          objectSpec$: observableOf(objectSpec),
        }),
        {count: 4},
    );

    run(action.run());

    return {$faceIndex, action, el, personaContext, stateService};
  });

  test('handleTrigger', () => {
    should(`increase the face by half the face count`, () => {
      _.stateService.set(_.$faceIndex, 1);

      _.action.trigger();

      assert(_.stateService.get(_.$faceIndex)).to.emitWith(3);
    });

    should(`wrap the face index by the count`, () => {
      _.stateService.set(_.$faceIndex, 1);

      const faceIndex$ = createSpySubject(_.stateService.get(_.$faceIndex));

      _.action.trigger();
      _.action.trigger();

      assert(faceIndex$).to.emitSequence([1, 3, 1]);
    });

    should(`use the config object`, () => {
      _.stateService.set(_.$faceIndex, 1);

      _.el.setAttribute('pb-flip-count', '6');

      const faceIndex$ = createSpySubject(_.stateService.get(_.$faceIndex));

      _.action.trigger();
      _.action.trigger();

      assert(faceIndex$).to.emitSequence([1, 4, 1]);
    });
  });
});

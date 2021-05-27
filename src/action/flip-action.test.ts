import {$stateService} from 'grapevine';
import {assert, createSpySubject, run, runEnvironment, should, test} from 'gs-testing';
import {fakeStateService} from 'gs-tools/export/state';
import {host} from 'persona';
import {createFakeContext, PersonaTesterEnvironment} from 'persona/export/testing';
import {BehaviorSubject, of} from 'rxjs';

import {TriggerType} from '../core/trigger-spec';
import {IsMultifaced} from '../payload/is-multifaced';

import {Config, flipAction, flipActionConfigSpecs} from './flip-action';
import {createFakeActionContext} from './testing/fake-action-context';


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

    const config$ = new BehaviorSubject({count: 4, trigger: {type: TriggerType.F} as const});
    const context = createFakeActionContext<IsMultifaced, Config>({
      config$,
      objectId$: of(stateService.modify(x => x.add(objectSpec))),
      vine: personaContext.vine,
    });
    const action = flipAction(host(flipActionConfigSpecs({}))._).action;

    return {$faceIndex, action, config$, context, el, personaContext, stateService};
  });

  test('handleTrigger', () => {
    should('increase the face by half the face count', () => {
      _.stateService.modify(x => x.set(_.$faceIndex, 1));

      run(of({mouseX: 0, mouseY: 0}).pipe(_.action(_.context)));

      assert(_.stateService.resolve(_.$faceIndex)).to.emitWith(3);
    });

    should('wrap the face index by the count', () => {
      _.stateService.modify(x => x.set(_.$faceIndex, 1));

      const faceIndex$ = createSpySubject(_.stateService.resolve(_.$faceIndex));

      run(
          of({mouseX: 0, mouseY: 0}, {mouseX: 0, mouseY: 0}).pipe(_.action(_.context)),
      );

      assert(faceIndex$).to.emitSequence([1, 3, 1]);
    });

    should('use the config object', () => {
      _.stateService.modify(x => x.set(_.$faceIndex, 1));

      _.config$.next({count: 6, trigger: {type: TriggerType.F}});

      const faceIndex$ = createSpySubject(_.stateService.resolve(_.$faceIndex));

      run(
          of({mouseX: 0, mouseY: 0}, {mouseX: 0, mouseY: 0}).pipe(_.action(_.context)),
      );

      assert(faceIndex$).to.emitSequence([1, 4, 1]);
    });
  });
});

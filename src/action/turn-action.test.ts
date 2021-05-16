import {$stateService} from 'grapevine';
import {assert, createSpySubject, run, runEnvironment, should, test} from 'gs-testing';
import {fakeStateService} from 'gs-tools/export/state';
import {createFakeContext, PersonaTesterEnvironment} from 'persona/export/testing';
import {of, BehaviorSubject} from 'rxjs';

import {fakePieceSpec} from '../objects/testing/fake-object-spec';

import {createFakeActionContext} from './testing/fake-action-context';
import {TurnAction, Config} from './turn-action';


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
    const objectId = stateService.modify(x => x.add(fakePieceSpec({
      payload: {$currentFaceIndex: $faceIndex},
    })));

    const config$ = new BehaviorSubject<Partial<Config>>({});
    const action = new TurnAction(
        createFakeActionContext({
          personaContext,
          objectId$: of(objectId),
        }),
        {count: 2},
    );

    run(action.run());

    return {$faceIndex, action, config$, el, personaContext, stateService};
  });

  test('handleTrigger', () => {
    should('increase the face by 1', () => {
      _.stateService.modify(x => x.set(_.$faceIndex, 0));

      run(of({mouseX: 0, mouseY: 0}).pipe(_.action.getOperator({config$: _.config$})));

      assert(_.stateService.resolve(_.$faceIndex)).to.emitWith(1);
    });

    should('wrap the face index by the count', () => {
      _.stateService.modify(x => x.set(_.$faceIndex, 1));

      const faceIndex$ = createSpySubject(_.stateService.resolve(_.$faceIndex));

      run(of({mouseX: 0, mouseY: 0}, {mouseX: 0, mouseY: 0}).pipe(_.action.getOperator({config$: _.config$})));

      assert(faceIndex$).to.emitSequence([1, 0, 1]);
    });

    should('use the config object', () => {
      _.stateService.modify(x => x.set(_.$faceIndex, 1));

      _.config$.next({count: 4});

      const faceIndex$ = createSpySubject(_.stateService.resolve(_.$faceIndex));

      run(of({mouseX: 0, mouseY: 0}, {mouseX: 0, mouseY: 0}).pipe(_.action.getOperator({config$: _.config$})));

      assert(faceIndex$).to.emitSequence([1, 2, 3]);
    });
  });
});

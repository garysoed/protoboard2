import {$stateService, Vine} from 'grapevine';
import {arrayThat, assert, createSpySubject, objectThat, run, should, test} from 'gs-testing';
import {fakeStateService, StateId} from 'gs-tools/export/state';
import {of} from 'rxjs';

import {moveObject} from './move-object';


test('@protoboard2/action/util/move-object', () => {
  should('move the object correctly', () => {
    const stateService = fakeStateService();
    const vine = new Vine({
      appName: 'test',
      overrides: [
        {override: $stateService, withValue: stateService},
      ],
    });

    const fromSpec1 = stateService.modify(x => x.add({}));
    const movedSpec = stateService.modify(x => x.add({}));
    const fromSpec2 = stateService.modify(x => x.add({}));
    const toSpec1 = stateService.modify(x => x.add({}));
    const toSpec2 = stateService.modify(x => x.add({}));

    const $fromContainer = stateService.modify(x => x.add({
      $contentSpecs: x.add([fromSpec1, movedSpec, fromSpec2]),
    }));
    const $toContainer = stateService.modify(x => x.add({
      $contentSpecs: x.add([toSpec1, toSpec2]),
    }));

    const fromContentIds$ = createSpySubject<ReadonlyArray<StateId<unknown>>|undefined>(
        stateService.resolve($fromContainer).$('$contentSpecs'),
    );
    const toContentIds$ = createSpySubject<ReadonlyArray<StateId<unknown>>|undefined>(
        stateService.resolve($toContainer).$('$contentSpecs'),
    );

    run(of({id: movedSpec, toIndex: 2}).pipe(
        moveObject(
            stateService.resolve($fromContainer),
            stateService.resolve($toContainer),
            vine,
        ),
    ));

    assert(fromContentIds$).to.emitWith(
        arrayThat<StateId<unknown>>().haveExactElements([fromSpec1, fromSpec2]),
    );
    assert(toContentIds$).to.emitWith(
        arrayThat<StateId<unknown>>().haveExactElements([
          toSpec1,
          toSpec2,
          objectThat<StateId<unknown>>().haveProperties({
            ...movedSpec,
          }),
        ]),
    );
  });
});

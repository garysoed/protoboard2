import {$stateService, Vine} from 'grapevine';
import {arrayThat, assert, createSpySubject, objectThat, run, should, test} from 'gs-testing';
import {fakeStateService, StateId} from 'gs-tools/export/state';
import {take, tap} from 'rxjs/operators';

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

    const $fromContentSpecs = stateService.modify(x => x.add([fromSpec1, movedSpec, fromSpec2]));
    const $toContentSpecs = stateService.modify(x => x.add([toSpec1, toSpec2]));

    const fromContentIds$ = createSpySubject<ReadonlyArray<StateId<unknown>>|undefined>(
        stateService.resolve($fromContentSpecs),
    );
    const toContentIds$ = createSpySubject<ReadonlyArray<StateId<unknown>>|undefined>(
        stateService.resolve($toContentSpecs),
    );

    run(moveObject(
        {$contentSpecs: $fromContentSpecs},
        {$contentSpecs: $toContentSpecs},
        vine,
    )
        .pipe(
            take(1),
            tap(fn => fn!(movedSpec, 2)),
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

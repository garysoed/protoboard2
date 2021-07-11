import {arrayThat, assert, createSpySubject, objectThat, run, should, test} from 'gs-testing';
import {fakeStateService, mutableState, ObjectPath} from 'gs-tools/export/state';
import {of} from 'rxjs';

import {moveObject} from './move-object';


test('@protoboard2/action/util/move-object', () => {
  should('move the object correctly', () => {
    const stateService = fakeStateService();

    const fromSpec1Path = stateService.immutablePath(stateService.addRoot({}));
    const movedSpecPath = stateService.immutablePath(stateService.addRoot({}));
    const fromSpec2Path = stateService.immutablePath(stateService.addRoot({}));
    const toSpec1Path = stateService.immutablePath(stateService.addRoot({}));
    const toSpec2Path = stateService.immutablePath(stateService.addRoot({}));

    const fromContainerId = stateService.addRoot({
      contentsId: mutableState([fromSpec1Path, movedSpecPath, fromSpec2Path]),
    });
    const toContainerId = stateService.addRoot({
      contentsId: mutableState([toSpec1Path, toSpec2Path]),
    });

    const fromContentIds$ = createSpySubject<ReadonlyArray<ObjectPath<unknown>>|undefined>(
        stateService._(fromContainerId).$('contentsId'),
    );
    const toContentIds$ = createSpySubject<ReadonlyArray<ObjectPath<unknown>>|undefined>(
        stateService._(toContainerId).$('contentsId'),
    );

    run(of({id: movedSpecPath, toIndex: 2}).pipe(
        moveObject(stateService._(fromContainerId), stateService._(toContainerId)),
    ));

    assert(fromContentIds$).to.emitWith(
        arrayThat<ObjectPath<unknown>>().haveExactElements([fromSpec1Path, fromSpec2Path]),
    );
    assert(toContentIds$).to.emitWith(
        arrayThat<ObjectPath<unknown>>().haveExactElements([
          toSpec1Path,
          toSpec2Path,
          objectThat<ObjectPath<unknown>>().haveProperties({
            ...movedSpecPath,
          }),
        ]),
    );
  });
});

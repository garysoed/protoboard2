import {Vine} from 'grapevine';
import {arrayThat, assert, createSpySubject, objectThat, run, should, test} from 'gs-testing';
import {StateService} from 'gs-tools/export/state';
import {$stateService} from 'mask';
import {take, tap} from 'rxjs/operators';

import {Indexed, createIndexed} from '../../coordinate/indexed';
import {ContentSpec} from '../../payload/is-container';

import {moveObject} from './move-object';


test('@protoboard2/action/util/move-object', () => {
  should('move the object correctly', () => {
    const fromSpec1 = {objectId: 'fromContentId1', coordinate: createIndexed(0)};
    const movedSpec = {objectId: 'movedId', coordinate: createIndexed(1)};
    const fromSpec2 = {objectId: 'fromContentId2', coordinate: createIndexed(2)};
    const toSpec1 = {objectId: 'toContentId1', coordinate: createIndexed(0)};
    const toSpec2 = {objectId: 'toContentId2', coordinate: createIndexed(1)};

    const vine = new Vine('test');

    const stateService = new StateService();
    $stateService.set(vine, () => stateService);

    const $fromContentSpecs = stateService.add([fromSpec1, movedSpec, fromSpec2]);
    const $toContentSpecs = stateService.add([toSpec1, toSpec2]);

    const fromContentIds$ = createSpySubject(stateService.get($fromContentSpecs));
    const toContentIds$ = createSpySubject(stateService.get($toContentSpecs));

    run(moveObject(
        {containerType: 'indexed', $contentSpecs: $fromContentSpecs},
        {containerType: 'indexed', $contentSpecs: $toContentSpecs},
        vine,
    )
        .pipe(
            take(1),
            tap(fn => fn!(movedSpec.objectId, {index: 2})),
        ));

    assert(fromContentIds$).to.emitWith(
        arrayThat<ContentSpec<Indexed>>().haveExactElements([fromSpec1, fromSpec2]),
    );
    assert(toContentIds$).to.emitWith(
        arrayThat<ContentSpec<Indexed>>().haveExactElements([
          toSpec1,
          toSpec2,
          objectThat<ContentSpec<Indexed>>().haveProperties({
            ...movedSpec,
            coordinate: objectThat<Indexed>().haveProperties(createIndexed(2)),
          }),
        ]),
    );
  });
});

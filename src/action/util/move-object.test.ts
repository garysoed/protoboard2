import {Vine} from 'grapevine';
import {arrayThat, assert, createSpySubject, objectThat, run, should, test} from 'gs-testing';
import {fakeStateService} from 'gs-tools/export/state';
import {$stateService} from 'mask';
import {take, tap} from 'rxjs/operators';

import {createIndexed, Indexed} from '../../coordinate/indexed';
import {fakePieceSpec} from '../../objects/testing/fake-object-spec';
import {ContentSpec} from '../../payload/is-container';

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

    const fromSpec1 = {
      objectId: stateService.modify(x => x.add(fakePieceSpec({payload: {}}))),
      coordinate: createIndexed(0),
    };
    const movedSpec = {
      objectId: stateService.modify(x => x.add(fakePieceSpec({payload: {}}))),
      coordinate: createIndexed(1),
    };
    const fromSpec2 = {
      objectId: stateService.modify(x => x.add(fakePieceSpec({payload: {}}))),
      coordinate: createIndexed(2),
    };
    const toSpec1 = {
      objectId: stateService.modify(x => x.add(fakePieceSpec({payload: {}}))),
      coordinate: createIndexed(0),
    };
    const toSpec2 = {
      objectId: stateService.modify(x => x.add(fakePieceSpec({payload: {}}))),
      coordinate: createIndexed(1),
    };

    const $fromContentSpecs = stateService.modify(x => x.add([fromSpec1, movedSpec, fromSpec2]));
    const $toContentSpecs = stateService.modify(x => x.add([toSpec1, toSpec2]));

    const fromContentIds$ = createSpySubject<ReadonlyArray<ContentSpec<'indexed'>>|undefined>(
        stateService.resolve($fromContentSpecs),
    );
    const toContentIds$ = createSpySubject<ReadonlyArray<ContentSpec<'indexed'>>|undefined>(
        stateService.resolve($toContentSpecs),
    );

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
        arrayThat<ContentSpec<'indexed'>>().haveExactElements([fromSpec1, fromSpec2]),
    );
    assert(toContentIds$).to.emitWith(
        arrayThat<ContentSpec<'indexed'>>().haveExactElements([
          toSpec1,
          toSpec2,
          objectThat<ContentSpec<'indexed'>>().haveProperties({
            ...movedSpec,
            coordinate: objectThat<Indexed>().haveProperties(createIndexed(2)),
          }),
        ]),
    );
  });
});

import { Vine } from 'grapevine';
import { arrayThat, assert, createSpySubject, run, should, test } from 'gs-testing';
import { StateService } from 'gs-tools/export/state';
import { $stateService } from 'mask';

import { Indexed } from '../../coordinate/indexed';
import { ContentSpec } from '../../payload/is-container';

import { moveObject } from './move-object';


test('@protoboard2/action/util/move-object', () => {
  should(`move the object correctly`, () => {
    const movedId = {objectId: 'movedId', coordinate: {index: 0}};
    const fromContentId1 = {objectId: 'fromContentId1', coordinate: {index: 0}};
    const fromContentId2 = {objectId: 'fromContentId2', coordinate: {index: 1}};
    const toContentId1 = {objectId: 'toContentId1', coordinate: {index: 0}};
    const toContentId2 = {objectId: 'toContentId2', coordinate: {index: 1}};

    const vine = new Vine('test');

    const stateService = new StateService();
    $stateService.set(vine, () => stateService);

    const $fromContentSpecs = stateService.add([fromContentId1, movedId, fromContentId2]);
    const $toContentSpecs = stateService.add([toContentId1, toContentId2]);

    const fromContentIds$ = createSpySubject(stateService.get($fromContentSpecs));
    const toContentIds$ = createSpySubject(stateService.get($toContentSpecs));

    run(moveObject($fromContentSpecs, $toContentSpecs, 1, 1, vine));

    assert(fromContentIds$).to.emitWith(
        arrayThat<ContentSpec<Indexed>>().haveExactElements([fromContentId1, fromContentId2]),
    );
    assert(toContentIds$).to.emitWith(
        arrayThat<ContentSpec<Indexed>>().haveExactElements([toContentId1, movedId, toContentId2]),
    );
  });

  should(`do nothing if the souce container has no items`, () => {
    const toContentId1 = {objectId: 'toContentId1', coordinate: {index: 0}};
    const toContentId2 = {objectId: 'toContentId2', coordinate: {index: 0}};

    const vine = new Vine('test');

    const stateService = new StateService();
    $stateService.set(vine, () => stateService);

    const $fromContentIds = stateService.add<ReadonlyArray<ContentSpec<Indexed>>>([]);
    const $toContentIds = stateService.add([toContentId1, toContentId2]);

    const fromContentIds$ = createSpySubject(stateService.get($fromContentIds));
    const toContentIds$ = createSpySubject(stateService.get($toContentIds));

    run(moveObject($fromContentIds, $toContentIds, 1, 1, vine));

    assert(fromContentIds$).to.emitWith(arrayThat<ContentSpec<Indexed>>().beEmpty());
    assert(toContentIds$).to.emitWith(
        arrayThat<ContentSpec<Indexed>>().haveExactElements([toContentId1, toContentId2]),
    );
  });
});

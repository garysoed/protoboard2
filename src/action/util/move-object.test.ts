import { Vine } from 'grapevine';
import { arrayThat, assert, createSpySubject, run, should, test } from 'gs-testing';
import { StateService } from 'gs-tools/export/state';
import { $stateService } from 'mask';

import { moveObject } from './move-object';


test('@protoboard2/action/util/move-object', () => {
  should(`move the object correctly`, () => {
    const movedId = 'movedId';
    const fromContentId1 = 'fromContentId1';
    const fromContentId2 = 'fromContentId2';
    const toContentId1 = 'toContentId1';
    const toContentId2 = 'toContentId2';

    const vine = new Vine('test');

    const stateService = new StateService();
    $stateService.set(vine, () => stateService);

    const $fromContentIds = stateService.add([fromContentId1, movedId, fromContentId2]);
    const $toContentIds = stateService.add([toContentId1, toContentId2]);

    const fromContentIds$ = createSpySubject(stateService.get($fromContentIds));
    const toContentIds$ = createSpySubject(stateService.get($toContentIds));

    run(moveObject($fromContentIds, $toContentIds, 1, 1, vine));

    assert(fromContentIds$).to.emitWith(
        arrayThat<string>().haveExactElements([fromContentId1, fromContentId2]),
    );
    assert(toContentIds$).to.emitWith(
        arrayThat<string>().haveExactElements([toContentId1, movedId, toContentId2]),
    );
  });
});

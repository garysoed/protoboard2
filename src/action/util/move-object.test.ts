import { arrayThat, assert, run, should, test } from 'gs-testing';
import { BehaviorSubject } from 'rxjs';

import { moveObject } from './move-object';


test('@protoboard2/action/util/move-object', () => {
  should(`move the object correctly`, () => {
    const movedId = 'movedId';
    const fromContentId1 = 'fromContentId1';
    const fromContentId2 = 'fromContentId2';
    const toContentId1 = 'toContentId1';
    const toContentId2 = 'toContentId2';

    const fromContentIds$ =
        new BehaviorSubject<readonly string[]>([fromContentId1, movedId, fromContentId2]);
    const fromState = {
      id: 'fromId',
      type: 'fromType',
      payload: {contentIds: fromContentIds$},
    };

    const toContentIds$ =
        new BehaviorSubject<readonly string[]>([toContentId1, toContentId2]);
    const toState = {
      id: 'toId',
      type: 'toType',
      payload: {contentIds: toContentIds$},
    };

    run(moveObject(fromState, toState, 1, 1));

    assert(fromContentIds$).to.emitWith(
        arrayThat<string>().haveExactElements([fromContentId1, fromContentId2]),
    );
    assert(toContentIds$).to.emitWith(
        arrayThat<string>().haveExactElements([toContentId1, movedId, toContentId2]),
    );
  });
});

import { Vine } from 'grapevine';
import { arrayThat, assert, createSpySubject, run, should, test } from 'gs-testing';
import { BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { createFakeStateService } from '../../state/testing/fake-state-service';
import { DroppablePayload } from '../payload/droppable-payload';

import { moveObject } from './move-object';

test('@protoboard2/action/util/move-object', () => {
  should(`move the object correctly`, () => {
    const vine = new Vine('test');
    const fakeStateService = createFakeStateService(vine);

    const movedId = 'movedId';
    const parentId = 'parentId';
    const otherParentContentId = 'otherParentContentId';
    const parentState = {
      id: parentId,
      type: 'parentType',
      payload: {contentIds: [otherParentContentId, movedId]},
    };
    fakeStateService.addState(parentState);

    const parentId$ = new BehaviorSubject<string|null>(parentId);
    const movedObjectState = {
      id: movedId,
      type: 'movedType',
      payload: {parentId: parentId$},
    };

    const otherContentId1 = 'otherContentId1';
    const otherContentId2 = 'otherContentId2';
    const destinationId = 'destinationId';
    const contentIds$ = new BehaviorSubject<readonly string[]>([otherContentId1, otherContentId2]);
    const destinationObjectState = {
      id: destinationId,
      type: 'destinationType',
      payload: {contentIds: contentIds$},
    };

    const parentContentIds$ = createSpySubject(fakeStateService
        .getState<DroppablePayload>(parentId)
        .pipe(switchMap(state => state!.payload.contentIds)),
    );

    run(moveObject(movedObjectState, destinationObjectState, vine, 1));

    assert(contentIds$).to.emitWith(
        arrayThat<string>().haveExactElements([otherContentId1, movedId, otherContentId2]),
    );
    assert(parentId$).to.emitWith(destinationId);
    assert(parentContentIds$).to.emitSequence([
      arrayThat<string>().haveExactElements([otherParentContentId, movedId]),
      arrayThat<string>().haveExactElements([otherParentContentId]),
    ]);
  });
});

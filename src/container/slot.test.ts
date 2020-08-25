import { arrayThat, assert, createSpySubject, run, should, test } from 'gs-testing';
import { $asArray, $pipe } from 'gs-tools/export/collect';
import { _p } from 'mask';
import { PersonaTesterFactory } from 'persona/export/testing';
import { Subject } from 'rxjs';
import { map, tap, withLatestFrom } from 'rxjs/operators';

import { $stateService, setStates } from '../state/state-service';
import { registerFakeStateHandler } from '../state/testing/register-fake-state-handler';

import { $, $slot, Slot, SlotPayload } from './slot';


test('@protoboard2/container/slot', init => {
  const OBJECT_ID = 'objectId';
  const factory = new PersonaTesterFactory(_p);

  const _ = init(() => {
    const tester = factory.build([Slot], document);
    const el = tester.createElement($slot.tag);
    run(el.setAttribute($.host._.objectId, OBJECT_ID));

    const onContentIds$ = new Subject<readonly string[]>();
    setStates(
        new Set([]),
        tester.vine,
    );

    run(onContentIds$.pipe(
        withLatestFrom($stateService.get(tester.vine)),
        tap(([contentIds, service]) => {
          service.getState<SlotPayload>(OBJECT_ID)!.payload.contentIds.next(contentIds);
        }),
    ));

    // Need to add to body so the dimensions work.
    document.body.appendChild(el.element);
    return {el, onContentIds$, tester};
  });

  test('contents$', () => {
    should(`render the contents correctly`, () => {
      const contents$ = createSpySubject(_.el.getChildren($.root).pipe(
          map(children => $pipe(children, $asArray())),
      ));

      const id1 = 'id1';
      const id2 = 'id2';
      const id3 = 'id3';

      const el1 = document.createElement('div1');
      const el2 = document.createElement('div2');
      const el3 = document.createElement('div3');

      registerFakeStateHandler(
          new Map([
            [id1, el1],
            [id2, el2],
            [id3, el3],
          ]),
          [{id: OBJECT_ID, type: 'test', payload: {contentIds: []}}],
          _.tester.vine,
      );

      _.onContentIds$.next([]);
      _.onContentIds$.next([id1]);
      _.onContentIds$.next([id1, id2]);
      _.onContentIds$.next([id1, id2, id3]);
      _.onContentIds$.next([id1, id3]);
      _.onContentIds$.next([id3]);
      _.onContentIds$.next([]);

      assert(contents$).to.emitSequence([
        arrayThat<Element>().haveExactElements([]),
        arrayThat<Element>().haveExactElements([el1]),
        arrayThat<Element>().haveExactElements([el1, el2]),
        arrayThat<Element>().haveExactElements([el1, el2, el3]),
        arrayThat<Element>().haveExactElements([el1, el3, el2]),
        arrayThat<Element>().haveExactElements([el1, el3, el2]),
        arrayThat<Element>().haveExactElements([el1, el3]),
        arrayThat<Element>().haveExactElements([el3, el1]),
        arrayThat<Element>().haveExactElements([el3]),
        arrayThat<Element>().haveExactElements([]),
      ]);
    });
  });
});

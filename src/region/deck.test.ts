// TODO
// import { arrayThat, assert, createSpySubject, run, should, test } from 'gs-testing';
// import { $asArray, $pipe } from 'gs-tools/export/collect';
// import { _p } from 'mask';
// import { PersonaTesterFactory } from 'persona/export/testing';
// import { Subject } from 'rxjs';
// import { map } from 'rxjs/operators';

// import { $stateService } from '../state-old/state-service';
// import { createFakeStateService } from '../state-old/testing/fake-state-service';
// import { registerFakeStateHandler } from '../state-old/testing/register-fake-state-handler';

// import { $, $deck, Deck, DeckPayload } from './deck';


// test('@protoboard2/region/deck', init => {
//   const OBJECT_ID = 'objectId';
//   const factory = new PersonaTesterFactory(_p);

//   const _ = init(() => {
//     const tester = factory.build([Deck], document);
//     const el = tester.createElement($deck.tag);
//     run(el.setAttribute($.host._.objectId, OBJECT_ID));

//     const fakeStateService = createFakeStateService(tester.vine);
//     $stateService.set(tester.vine, () => fakeStateService);

//     const onContentIds$ = new Subject<readonly string[]>();
//     fakeStateService.setStates(new Set([]));

//     run(fakeStateService.subscribeValuesFor<DeckPayload>(OBJECT_ID, {contentIds: onContentIds$}));

//     // Need to add to body so the dimensions work.
//     document.body.appendChild(el.element);
//     return {el, fakeStateService, onContentIds$, tester};
//   });


//   test('contents$', () => {
//     should(`render only the top item`, () => {
//       const contents$ = createSpySubject(_.el.getChildren($.contents).pipe(
//           map(children => $pipe(children, $asArray())),
//       ));

//       const id1 = 'id1';
//       const id2 = 'id2';

//       const el1 = document.createElement('div1');
//       const el2 = document.createElement('div2');

//       registerFakeStateHandler(
//           new Map([
//             [id1, el1],
//             [id2, el2],
//           ]),
//           _.tester.vine,
//       );

//       _.fakeStateService.setStates(new Set([
//         {type: 'test', id: id1, payload: {}},
//         {type: 'test', id: id2, payload: {}},
//         {id: OBJECT_ID, type: 'test', payload: {contentIds: []}},
//       ]));

//       _.onContentIds$.next([]);
//       _.onContentIds$.next([id1]);
//       _.onContentIds$.next([id1, id2]);
//       _.onContentIds$.next([id2]);
//       _.onContentIds$.next([]);

//       assert(contents$).to.emitSequence([
//         arrayThat<Element>().haveExactElements([]),
//         arrayThat<Element>().haveExactElements([el1]),
//         arrayThat<Element>().haveExactElements([]), // el1 was removed to be replaced with el2
//         arrayThat<Element>().haveExactElements([el2]),
//         arrayThat<Element>().haveExactElements([]),
//       ]);
//     });
//   });
// });

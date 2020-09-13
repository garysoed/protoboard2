// TODO
// import { assert, run, runEnvironment, should, test } from 'gs-testing';
// import { FakeSeed, fromSeed } from 'gs-tools/export/random';
// import { _v } from 'mask';
// import { createFakeContext, PersonaTesterEnvironment } from 'persona/export/testing';
// import { of as observableOf, ReplaySubject } from 'rxjs';

// import { RollAction } from './roll-action';
// import { createFakeActionContext } from './testing/fake-action-context';
// import { $random } from './util/random';


// test('@protoboard2/action/roll-action', init => {
//   const _ = init(() => {
//     runEnvironment(new PersonaTesterEnvironment());

//     const el = document.createElement('div');
//     const shadowRoot = el.attachShadow({mode: 'open'});

//     const personaContext = createFakeContext({shadowRoot});
//     const seed = new FakeSeed();
//     $random.set(personaContext.vine, () => fromSeed(seed));

//     const faceIndex$ = new ReplaySubject<number>(1);
//     const state$ = {
//       id: 'objectId',
//       type: 'objectType',
//       payload: {faceIndex: faceIndex$},
//     };

//     const action = new RollAction(
//         createFakeActionContext({
//           host$: observableOf(el),
//           personaContext,
//           state$: observableOf(state$),
//         }),
//         {count: 3},
//     );

//     run(action.run());

//     return {action, el, faceIndex$, seed};
//   });

//   test('handleTrigger', () => {
//     should(`change the current face correctly`, () => {
//       _.faceIndex$.next(0);
//       _.seed.values = [0.9];

//       _.action.trigger();

//       assert(_.faceIndex$).to.emitWith(2);
//     });

//     should(`use the config object`, () => {
//       _.faceIndex$.next(0);

//       _.el.setAttribute('pb-roll-count', '4');

//       _.seed.values = [0.9];

//       _.action.trigger();

//       assert(_.faceIndex$).to.emitWith(3);
//     });
//   });
// });

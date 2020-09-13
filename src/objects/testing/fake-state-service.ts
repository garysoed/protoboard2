// import { Vine } from 'grapevine';
// import { EMPTY, merge, Observable, Subject } from 'rxjs';
// import { switchMap, tap } from 'rxjs/operators';

// import { SavedState } from '../saved-state';
// import { $stateService, StateService } from '../state-service';


// type ObservablePayload<P extends object> = {readonly [K in keyof P]: Observable<P[K]>};

// class FakeStateService extends StateService {
//   readonly [Symbol.toStringTag] = 'FakeStateService';

//   addState<P extends object>(state: SavedState<P>): void {
//     const existingStates = this.statesRaw$.getValue();
//     this.setStates(new Set([...existingStates, state]));
//   }

//   subscribeValuesFor<P extends object>(
//       objectId: string,
//       payloads: Partial<ObservablePayload<P>>,
//   ): Observable<unknown> {
//     return this.getState(objectId).pipe(
//         switchMap(state => {
//           if (!state) {
//             return EMPTY;
//           }

//           const payload$list: Array<Observable<unknown>> = [];
//           for (const key in payloads) {
//             if (!payloads.hasOwnProperty(key)) {
//               continue;
//             }

//             const stateObs = (state.payload as any)[key] as Subject<any>;
//             payload$list.push((payloads[key] as Observable<any>).pipe(
//                 tap(value => {
//                   stateObs.next(value);
//                 }),
//             ));
//           }

//           return merge(...payload$list);
//         }),
//     );
//   }
// }

// export function createFakeStateService(vine: Vine): FakeStateService {
//   const service = new FakeStateService();
//   $stateService.set(vine, () => service);
//   return service;
// }

// import { source } from 'grapevine';
// import { $asArray, $asRecord, $map, $pipe } from 'gs-tools/export/collect';
// import { cache } from 'gs-tools/export/data';
// import { PersonaContext } from 'persona';
// import { BehaviorSubject, combineLatest, Observable, of as observableOf } from 'rxjs';
// import { map, shareReplay, switchMap } from 'rxjs/operators';

// import { ObjectSpec } from './object-spec';
// import { SavedState } from './saved-state';


// export class StateService {
//   protected readonly statesRaw$ = new BehaviorSubject<ReadonlySet<SavedState<object>>>(new Set());

//   @cache()
//   get currentState$(): Observable<ReadonlyMap<string, SavedState<object>>> {
//     return this.statesMap$.pipe(
//         switchMap(statesMap => {
//           const states$List = $pipe(
//               statesMap,
//               $map(([key, state]) => {
//                 const payloads$ = resolveMap(state.payload);
//                 return payloads$.pipe(
//                     map(payload => {
//                       return [key, {...state, payload}] as [string, SavedState<object>];
//                     }),
//                 );
//               }),
//               $asArray(),
//           );

//           if (states$List.length <= 0) {
//             return observableOf(new Map());
//           }

//           return combineLatest(states$List).pipe(map(pairs => new Map(pairs)));
//         }),
//     );
//   }

//   getState<P extends object>(id: string): Observable<ObjectSpec<P>|null> {
//     return this.statesMap$.pipe(map(statesMap => statesMap.get(id) as ObjectSpec<P> || null));
//   }

//   setStates(statesRaw: ReadonlySet<SavedState<object>>): void {
//     this.statesRaw$.next(statesRaw);
//   }
// }

// export const $stateService = source('StateService', () => new StateService());

// function resolveMap(
//     subjectObject: object,
// ): Observable<Record<string, unknown>> {
//   const payloads$List: Array<Observable<[string, unknown]>> = [];
//   for (const key in subjectObject) {
//     if (!subjectObject.hasOwnProperty(key)) {
//       continue;
//     }

//     const subject = (subjectObject as any)[key];
//     if (!(subject instanceof BehaviorSubject)) {
//       continue;
//     }

//     payloads$List.push(subject.pipe(map(value => [key, value])));
//   }

//   if (payloads$List.length <= 0) {
//     return observableOf({});
//   }

//   return combineLatest(payloads$List).pipe(
//       map(pairs => $pipe(pairs, $asRecord())),
//   );
// }

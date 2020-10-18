// import { stream, Vine } from 'grapevine';
// import { cache } from 'gs-tools/export/data';
// import { SimpleIdGenerator } from 'gs-tools/export/random';
// import { StateService } from 'gs-tools/export/state';
// import { $saveService, $stateService, SaveService } from 'mask';
// import { combineLatest, Observable } from 'rxjs';
// import { map, switchMap } from 'rxjs/operators';

// import { $objectService } from '../../src/objects/object-service';
// import { $demoState } from '../state/demo-state';
// import { PieceSpec } from '../state/piece-spec';
// import { StagedPieceSpec } from '../state/staged-piece-spec';
// import { $pieceSpecs, $stagingState, StagingState } from '../state/staging-state';


// type SetStagingFn = (isStaging: boolean) => void;

// export class StagingService {

//   @cache()
//   get setStagingFn(): Observable<SetStagingFn|null> {
//     return combineLatest([
//       $demoState.get(this.vine),
//       $stateService.get(this.vine),
//     ])
//     .pipe(
//         map(([demoState, stateService]) => {
//           if (!demoState) {
//             return null;
//           }

//           return (isStaging: boolean) => {
//             stateService.set(demoState.$isStaging, isStaging);
//             this.saveService.setSaving(!isStaging);
//           };
//         }),
//     );
//   }

//   constructor(
//       private readonly currentPieceSpecs: readonly PieceSpec[]|null,
//       private readonly objectIds: ReadonlySet<string>,
//       private readonly saveService: SaveService,
//       private readonly stagingState: StagingState,
//       private readonly stateService: StateService,
//       private readonly vine: Vine,
//   ) {  }

//   addPiece(pieceSpecNoId: PieceSpecNoId): void {
//   }

//   clear(): void {
//     this.stateService.set(this.stagingState.$pieceSpecs, []);
//   }

//   startPlay(): void {
//   }
// }

// export const $stagingService = stream(
//     'StagingService',
//     vine => {
//       return combineLatest([
//         $objectService.get(vine),
//         $pieceSpecs.get(vine),
//         $saveService.get(vine),
//         $stagingState.get(vine),
//         $stateService.get(vine),
//       ])
//       .pipe(
//           switchMap(([objectService, pieceSpecs, saveService, stagingState, stateService]) => {
//             return objectService.objectIds$.pipe(
//                 map(objectIds => {
//                   if (!stagingState) {
//                     return null;
//                   }
//                   return new StagingService(
//                       pieceSpecs,
//                       objectIds,
//                       saveService,
//                       stagingState,
//                       stateService,
//                       vine,
//                   );
//                 }),
//             );
//           }),
//       );
//     },
// );

import { source, stream } from 'grapevine';
import { $asMap, $map, $pipe } from 'gs-tools/export/collect';
import { StateId } from 'gs-tools/export/state';
import { $stateService } from 'mask';
import { combineLatest, of as observableOf } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { ObjectSpec } from './object-spec';


export interface HasObjectSpecList {
  readonly objectSpecs: ReadonlyArray<ObjectSpec<any>>;
}

export const $objectSpecListId = source<StateId<HasObjectSpecList>|null>(
    'objectSpecListId',
    () => null,
);

export const $objectSpecMap = stream<ReadonlyMap<string, ObjectSpec<any>>, typeof globalThis>(
    'objectSpecMap',
    vine => combineLatest([$objectSpecListId.get(vine), $stateService.get(vine)]).pipe(
        switchMap(([objectSpecId, stateService]) => {
          if (!objectSpecId) {
            return observableOf(null);
          }

          return stateService.get(objectSpecId);
        }),
        map(hasObjectSpecList => {
          if (!hasObjectSpecList) {
            return new Map();
          }

          return $pipe(
              hasObjectSpecList.objectSpecs,
              $map(spec => ([spec.id, spec] as [string, ObjectSpec<any>])),
              $asMap(),
          );
        }),
    ),
    globalThis,
);

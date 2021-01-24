import {source, stream, Vine} from 'grapevine';
import {StateId} from 'gs-tools/export/state';
import {$stateService} from 'mask';
import {RenderSpec} from 'persona';
import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {ObjectSpec} from '../types/object-spec';


/**
 * Function called when creating the object corresponding to the state.
 *
 * @thHidden
 */
export type ObjectCreateSpec<O extends ObjectSpec<any>> = (
    objectId: StateId<O>,
    vine: Vine,
) => Observable<RenderSpec|null|undefined>;

export const $createSpecMap = source<ReadonlyMap<string, ObjectCreateSpec<any>>>(
    'createSpecMap',
    () => new Map(),
);

export const $getRenderSpec = stream<ObjectCreateSpec<any>>(
    'getRenderSpec',
    vine => combineLatest([$createSpecMap.get(vine), $stateService.get(vine)]).pipe(
        map(([createSpecMap, stateService]) => {
          return (id: StateId<ObjectSpec<any>>) => {
            return stateService.resolve(id)._('type').pipe(
                switchMap(stateType => {
                  if (stateType === undefined) {
                    return observableOf(null);
                  }

                  const createSpec = createSpecMap.get(stateType);
                  if (!createSpec) {
                    return observableOf(null);
                  }

                  return createSpec(id, vine);
                }),
            );
          };
        }),
    ),
);
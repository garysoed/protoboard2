import {$asArray, $map, $pipe, $zip, countableIterable} from 'gs-tools/export/collect';
import {StateId} from 'gs-tools/export/state';

import {Indexed} from '../coordinate/indexed';


export interface TypeCoordinateMapping {
  readonly indexed: Indexed;
}

export interface ContentSpec<C extends CoordinateTypes> {
  readonly objectId: StateId<unknown>;
  readonly coordinate: TypeCoordinateMapping[C];
}

export type CoordinateTypes = keyof TypeCoordinateMapping;

export interface IsContainer<T extends CoordinateTypes> {
  readonly containerType: T;
  readonly $contentSpecs: StateId<ReadonlyArray<ContentSpec<T>>>;
}

export function indexedContentSpecs(
    specs: ReadonlyArray<StateId<unknown>>,
): ReadonlyArray<ContentSpec<'indexed'>> {
  return $pipe(
      specs,
      $zip(countableIterable()),
      $map(([objectId, index]) => ({
        objectId,
        coordinate: {index},
      })),
      $asArray(),
  );
}

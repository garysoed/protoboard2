import {source, stream} from 'grapevine';
import {StateId} from 'gs-tools/export/state';
import {map} from 'rxjs/operators';

import {CoordinateTypes} from '../payload/is-container';
import {ContainerSpec} from '../types/container-spec';


const $parentMap = source(
    'contentMap',
    () => new Map<string, StateId<ContainerSpec<any, CoordinateTypes>>>(),
);

export const $getParent = stream(
    'getParent',
    vine => $parentMap.get(vine).pipe(
        map(parentMap => {
          return (id: StateId<any>) => parentMap.get(id.id) ?? null;
        }),
    ),
);

export const $setParent = source(
    'setParent',
    vine => (child: StateId<any>, parent: StateId<ContainerSpec<any, CoordinateTypes>>) => {
      $parentMap.set(vine, oldMap => new Map([...oldMap, [child.id, parent]]));
    },
);

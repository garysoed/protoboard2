import {source} from 'grapevine';
import {StateId} from 'gs-tools/export/state';
import {Subject, ReplaySubject, Observable} from 'rxjs';
import {map, scan, startWith} from 'rxjs/operators';

import {IsContainer} from '../payload/is-container';

type ContainerStateId = StateId<IsContainer>;
const $parentMapEntries$ = source<Subject<[string, ContainerStateId]>>(
    'parentMapEntries',
    () => new ReplaySubject(),
);

const $parentMap = source<Observable<ReadonlyMap<string, ContainerStateId>>>(
    'contentMap',
    vine => $parentMapEntries$.get(vine).pipe(
        scan((parentMap, entry) => new Map([...parentMap, entry]), new Map()),
        startWith(new Map()),
    ),
);

export const $getParent = source(
    'getParent',
    vine => $parentMap.get(vine).pipe(
        map(parentMap => {
          return (id: StateId<any>) => parentMap.get(id.id) ?? null;
        }),
    ),
);

export const $setParent = source(
    'setParent',
    vine => (child: StateId<any>, parent: StateId<IsContainer>) => {
      $parentMapEntries$.get(vine).next([child.id, parent]);
    },
);

import {source} from 'grapevine';
import {StateId} from 'gs-tools/export/state';
import {RenderSpec} from 'persona';
import {Observable, of, ReplaySubject, Subject} from 'rxjs';
import {scan, startWith, switchMap} from 'rxjs/operators';

interface RenderObjectSpec {
  readonly objectId: StateId<unknown>;
  readonly renderFn: RenderObjectFn;
}

export type RenderObjectFn = () => Observable<RenderSpec>;

const $renderObjectSpec = source<Subject<RenderObjectSpec>>(
    'renderObjectSpec',
    () => new ReplaySubject(),
);

const $renderObjectMap = source<Observable<ReadonlyMap<string, RenderObjectFn>>>(
    'renderObjectMap',
    vine => $renderObjectSpec.get(vine).pipe(
        scan((specMap, entry) => new Map([...specMap, [entry.objectId.id, entry.renderFn]]), new Map()),
        startWith(new Map()),
    ));

type RegisterRenderObjectFn = (objectId: StateId<unknown>, renderFn: RenderObjectFn) => void;
export const $registerRenderObject = source<RegisterRenderObjectFn>(
    'registerRenderObject',
    vine =>
      (objectId: StateId<unknown>, renderFn: RenderObjectFn) =>
        $renderObjectSpec.get(vine).next({objectId, renderFn}),
);

type RenderFn = (objectId: StateId<unknown>) => Observable<RenderSpec|null>;
export const $getRenderSpec = source<RenderFn>(
    'render',
    vine => (objectId: StateId<unknown>) => $renderObjectMap.get(vine).pipe(
        switchMap(renderMap => {
          const renderFn = renderMap.get(objectId.id);
          if (!renderFn) {
            return of(null);
          }

          return renderFn();
        }),
    ),
);
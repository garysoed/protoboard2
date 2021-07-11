import {source} from 'grapevine';
import {immutablePathOf, ObjectPath} from 'gs-tools/export/state';
import {RenderSpec} from 'persona';
import {Observable, of, ReplaySubject, Subject} from 'rxjs';
import {scan, startWith, switchMap} from 'rxjs/operators';

interface RenderObjectSpec {
  readonly objectPath: ObjectPath<unknown>;
  readonly renderFn: RenderObjectFn;
}

export type RenderObjectFn = () => Observable<RenderSpec>;

const $renderObjectSpec = source<Subject<RenderObjectSpec>>(() => new ReplaySubject());

const $renderObjectMap = source<Observable<ReadonlyMap<string, RenderObjectFn>>>(
    vine => $renderObjectSpec.get(vine).pipe(
        scan((specMap, entry) => new Map([...specMap, [immutablePathOf(entry.objectPath).id, entry.renderFn]]), new Map()),
        startWith(new Map()),
    ));

type RegisterRenderObjectFn = (objectId: ObjectPath<unknown>, renderFn: RenderObjectFn) => void;
export const $registerRenderObject = source<RegisterRenderObjectFn>(vine =>
  (objectId: ObjectPath<unknown>, renderFn: RenderObjectFn) =>
    $renderObjectSpec.get(vine).next({objectPath: objectId, renderFn}),
);

type RenderFn = (objectId: ObjectPath<unknown>) => Observable<RenderSpec|null>;
export const $getRenderSpec = source<RenderFn>(vine => (objectPath: ObjectPath<unknown>) => $renderObjectMap.get(vine).pipe(
    switchMap(renderMap => {
      const renderFn = renderMap.get(immutablePathOf(objectPath).id);
      if (!renderFn) {
        return of(null);
      }

      return renderFn();
    }),
));
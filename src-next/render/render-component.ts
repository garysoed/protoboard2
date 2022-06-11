import {Vine} from 'grapevine';
import {RenderSpec} from 'persona';
import {combineLatest, Observable, of, OperatorFunction} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {ComponentId} from '../id/component-id';
import {$getComponentRenderSpec$} from '../renderspec/render-component-spec';

type RenderComponentFn = (componentId: ComponentId<unknown>) => RenderSpec|null;

export function renderComponent(
    vine: Vine,
    id$: Observable<ReadonlyArray<ComponentId<unknown>>>,
    renderContents: (fn: RenderComponentFn) => OperatorFunction<ReadonlyArray<ComponentId<unknown>>, unknown>,
): Observable<unknown> {
  return combineLatest([
    id$,
    $getComponentRenderSpec$.get(vine),
  ])
      .pipe(
          switchMap(([componentIds, renderSpecProvider]) => {
            return of(componentIds).pipe(
                renderContents(componentId => renderSpecProvider(componentId)),
            );
          }),
      );
}
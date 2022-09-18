import {Vine} from 'grapevine';
import {RenderSpec} from 'persona';
import {combineLatest, Observable, of, OperatorFunction} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {ComponentId} from '../id/component-id';
import {$getComponentRenderSpec$} from '../renderspec/render-component-spec';

type RenderComponentFn = (componentId: ComponentId) => RenderSpec|null;

export function renderComponent(
    vine: Vine,
    id$: Observable<readonly ComponentId[]>,
    renderContents: (fn: RenderComponentFn) => OperatorFunction<readonly ComponentId[], unknown>,
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
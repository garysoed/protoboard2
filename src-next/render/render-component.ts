import {Vine} from 'grapevine';
import {RenderSpec} from 'persona';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {$getComponentRenderSpec$} from '../renderspec/render-component-spec';

export function renderComponent(
    vine: Vine,
    componentId: {},
): Observable<RenderSpec|null> {
  return $getComponentRenderSpec$.get(vine).pipe(
      map(getComponentRenderSpec => getComponentRenderSpec(componentId)),
  );
}
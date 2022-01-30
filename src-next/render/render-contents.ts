import {Vine} from 'grapevine';
import {RenderSpec} from 'persona';
import {combineLatest, OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';

import {$getComponentRenderSpec$} from './render-component-spec';


export function renderContents(
    vine: Vine,
): OperatorFunction<ReadonlyArray<{}>|undefined, readonly RenderSpec[]> {
  return contentIds$ => {
    return combineLatest([
      contentIds$,
      $getComponentRenderSpec$.get(vine),
    ])
        .pipe(
            map(([contentIds, getRenderSpec]) => {
              if (!contentIds) {
                return [];
              }
              return contentIds.map(getRenderSpec);
            }),
        );
  };
}

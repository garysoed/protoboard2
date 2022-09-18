import {Vine} from 'grapevine';
import {$asArray, $filterNonNull, $map} from 'gs-tools/export/collect';
import {$pipe} from 'gs-tools/export/typescript';
import {RenderSpec} from 'persona';
import {combineLatest, OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';

import {ComponentId} from '../id/component-id';
import {$getComponentRenderSpec$} from '../renderspec/render-component-spec';


export function renderContents(
    vine: Vine,
): OperatorFunction<readonly ComponentId[]|undefined, readonly RenderSpec[]> {
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
              return $pipe(contentIds, $map(getRenderSpec), $filterNonNull(), $asArray());
            }),
        );
  };
}

import {Vine} from 'grapevine';
import {RenderSpec} from 'persona';
import {combineLatest, OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';

import {$getRenderSpec$} from './render-component-spec';


export function renderContents(
    vine: Vine,
): OperatorFunction<ReadonlyArray<{}>|undefined, readonly RenderSpec[]> {
  return contentIds$ => {
    return combineLatest([
      contentIds$,
      $getRenderSpec$.get(vine),
    ])
        .pipe(
            map(([contentIds, getRenderSpec]) => {
              if (!getRenderSpec) {
                throw new Error('getRenderSpec is not initialized');
              }

              if (!contentIds) {
                return [];
              }
              return contentIds.map(getRenderSpec);
            }),
        );
  };
}


// return nodes$.pipe(
//   map(renderSpecs => $pipe(
//       renderSpecs,
//       $filterNonNull(),
//       $map(({id, spec}) => {
//         const decorator: Decorator<NodeWithId<Node>> = () => {
//           $setParent.get(vine)(id, containerId);
//           return EMPTY;
//         };

//         const decorators: Array<Decorator<NodeWithId<any>>> = [decorator];
//         if (spec.decorators) {
//           decorators.push(...spec.decorators);
//         }

//         return {...spec, decorators};
//       }),
//       $asArray(),
//   )),
// );
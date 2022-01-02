import {Vine} from 'grapevine';
import {ImmutableResolver} from 'gs-tools/export/state';
import {RenderSpec} from 'persona';
import {combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {ContainerState} from '../types/container-state';

import {$getRenderSpec$} from './render-component-spec';


export function renderContents(
    containerState$: ImmutableResolver<ContainerState>,
    vine: Vine,
): Observable<readonly RenderSpec[]> {
  return combineLatest([
    containerState$.$('contentIds'),
    $getRenderSpec$.get(vine),
  ])
      .pipe(
          map(([contentIds, getRenderSpec]) => {
            if (!getRenderSpec) {
              throw new Error('getRenderSpec is not initialized');
            }
            return contentIds.map(getRenderSpec);
          }),
      );
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
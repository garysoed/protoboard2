import { Vine } from 'grapevine';
import { of as observableOf, throwError } from 'rxjs';

import { registerObjectCreateSpec } from '../object-service';


export function registerFakeStateHandler(
    nodeMap: ReadonlyMap<string, Node>,
    vine: Vine,
): void {
  registerObjectCreateSpec(
      'test',
      state => {
        const node = nodeMap.get(state.id);
        if (!node) {
          return throwError(`Node for ${state.id} not found`);
        }

        return observableOf(node);
      },
      vine,
  );
}

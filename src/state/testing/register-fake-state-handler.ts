import { Vine } from 'grapevine';
import { of as observableOf, throwError } from 'rxjs';

import { registerStateHandler } from '../renderable-service';


export function registerFakeStateHandler(
    nodeMap: ReadonlyMap<string, Node>,
    vine: Vine,
): void {
  registerStateHandler(
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

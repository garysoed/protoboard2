import { Vine } from 'grapevine';
import { $asArray, $map, $pipe } from 'gs-tools/export/collect';
import { of as observableOf, throwError } from 'rxjs';

import { registerStateHandler } from '../register-state-handler';
import { setStates } from '../state-service';

export function registerFakeStateHandler(
    nodeMap: ReadonlyMap<string, Node>,
    vine: Vine,
): void {
  const objectType = 'test';
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

  const states = $pipe(
      nodeMap,
      $map(([id]) => ({type: objectType, id, payload: {}})),
      $asArray(),
  );
  setStates(states, vine);
}

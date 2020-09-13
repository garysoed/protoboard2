import { source, Vine } from 'grapevine';

import { StateHandler } from './state-service';

export const $stateHandlers =
    source('stateHandlers', () => new Map<string, StateHandler<object>>());
export function registerStateHandler<P extends object>(
    type: string,
    handler: StateHandler<P>,
    vine: Vine,
): void {
  $stateHandlers.set(
      vine,
      existingHandlers => new Map([
        ...existingHandlers,
        [type, handler as StateHandler<object>],
      ]),
  );
}

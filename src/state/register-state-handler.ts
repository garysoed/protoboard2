import { source, Vine } from 'grapevine';
import { PersonaContext } from 'persona';
import { Observable } from 'rxjs';

import { State } from './state';

/**
 * Function called when creating the object corresponding to the state.
 *
 * @thHidden
 */
export type OnCreateFn<P extends object> =
    (state: State<P>, context: PersonaContext) => Observable<Node>;

export const $stateHandlers = source<ReadonlyMap<string, OnCreateFn<object>>>(() => new Map());

/**
 * Registers handler for the state.
 *
 * @param type - Type of the object corresponding to the on create function.
 * @param onCreate - Function called when creating the object corresponding to this state.
 * @param vine - The Vine object.
 * @thModule core
 *
 * TODO: Should take custom element spec.
 */
export function registerStateHandler<P extends object>(
    type: string,
    onCreate: OnCreateFn<P>,
    vine: Vine,
): void {
  $stateHandlers.set(vine, map => new Map([...map, [type, onCreate as OnCreateFn<object>]]));
}

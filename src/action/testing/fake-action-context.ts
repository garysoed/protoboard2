import {PersonaContext} from 'persona';
import {EMPTY} from 'rxjs';

import {ActionContext} from '../action-context';


export function createFakeActionContext<O>(
    context: Partial<ActionContext<O>> & {readonly personaContext: PersonaContext},
): ActionContext<O> {
  return {
    objectId$: EMPTY,
    ...context,
  };
}

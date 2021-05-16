import {PersonaContext} from 'persona';

import {ActionContext} from '../../core/base-action';


type PartialActionContext = Partial<ActionContext> &
    {readonly personaContext: PersonaContext};

export function createFakeActionContext(
    context: PartialActionContext,
): ActionContext {
  return {
    ...context,
  };
}

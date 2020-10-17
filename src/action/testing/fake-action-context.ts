import { PersonaContext } from 'persona';
import { Observable } from 'rxjs';

import { ActionContext } from '../../core/base-action';
import { ObjectSpec } from '../../objects/object-spec';


type PartialActionContext<P> = Partial<ActionContext<P>> &
    {readonly personaContext: PersonaContext; objectSpec$: Observable<ObjectSpec<P>|null>};

export function createFakeActionContext<P>(context: PartialActionContext<P>): ActionContext<P> {
  return {
    host: document.createElement('div'),
    ...context,
  };
}

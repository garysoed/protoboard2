import { PersonaContext } from 'persona';
import { Observable, ReplaySubject } from 'rxjs';

import { ActionContext } from '../../core/base-action';


type PartialActionContext = Partial<ActionContext> &
    {readonly personaContext: PersonaContext; objectId$: Observable<string>};

export function createFakeActionContext(context: PartialActionContext): ActionContext {
  return {
    host$: new ReplaySubject<Element>(1),
    ...context,
  };
}

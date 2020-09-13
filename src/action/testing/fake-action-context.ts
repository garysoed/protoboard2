import { PersonaContext } from 'persona';
import { ReplaySubject } from 'rxjs';

import { ActionContext } from '../../core/base-action';
import { ObjectSpec } from '../../objects/object-spec';

type PartialActionContext<P extends object> = Partial<ActionContext<P>> &
    {readonly personaContext: PersonaContext};

export function createFakeActionContext<P extends object>(
    context: PartialActionContext<P>,
): ActionContext<P> {
  return {
    host$: new ReplaySubject<Element>(1),
    state$: new ReplaySubject<ObjectSpec<P>>(1),
    ...context,
  };
}

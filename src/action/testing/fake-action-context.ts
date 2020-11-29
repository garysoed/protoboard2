import {StateId} from 'gs-tools/export/state';
import {PersonaContext} from 'persona';
import {Observable} from 'rxjs';

import {ActionContext} from '../../core/base-action';
import {ObjectSpec} from '../../types/object-spec';


type PartialActionContext<O extends ObjectSpec<any>> = Partial<ActionContext<O>> &
    {readonly personaContext: PersonaContext; objectId$: Observable<StateId<O>|null>};

export function createFakeActionContext<O extends ObjectSpec<any>>(context: PartialActionContext<O>): ActionContext<O> {
  return {
    host: document.createElement('div'),
    ...context,
  };
}

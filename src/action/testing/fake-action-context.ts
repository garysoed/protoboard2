import {StateId} from 'gs-tools/export/state';
import {PersonaContext} from 'persona';
import {Observable, of} from 'rxjs';

import {ActionContext} from '../../core/base-action';
import {ObjectSpec} from '../../types/object-spec';


type PartialActionContext<O extends ObjectSpec<any>, C> = Partial<ActionContext<O, C>> &
    {readonly personaContext: PersonaContext; objectId$: Observable<StateId<O>|null>};

export function createFakeActionContext<O extends ObjectSpec<any>, C>(
    context: PartialActionContext<O, C>,
): ActionContext<O, C> {
  return {
    host: document.createElement('div'),
    getConfig$: () => of({}),
    ...context,
  };
}

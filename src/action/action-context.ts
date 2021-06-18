import {StateId} from 'gs-tools/export/state';
import {PersonaContext} from 'persona';
import {Observable} from 'rxjs';


export interface ActionContext<O> {
  readonly objectId$: Observable<StateId<O>|null>;
  readonly personaContext: PersonaContext;
}

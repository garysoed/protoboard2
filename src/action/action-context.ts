import {$resolveState} from 'grapevine';
import {StateId} from 'gs-tools/export/state';
import {PersonaContext} from 'persona';
import {Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';


export interface ActionContext<O> {
  readonly objectId$: Observable<StateId<O>|null>;
  readonly personaContext: PersonaContext;
}

export function getObject$<O>(context: ActionContext<O>): Observable<O|undefined> {
  return context.objectId$.pipe(
      switchMap(objectId => $resolveState.get(context.personaContext.vine)(objectId)),
  );
}
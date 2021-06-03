import {$resolveState, Vine} from 'grapevine';
import {StateId} from 'gs-tools/export/state';
import {PersonaContext} from 'persona';
import {Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';


export interface ActionContext<O, C> {
  readonly config$: Observable<C>
  readonly objectId$: Observable<StateId<O>|null>;
  readonly personaContext: PersonaContext;
  readonly vine: Vine;
}

export function getObject$<O, C>(context: ActionContext<O, C>): Observable<O|undefined> {
  return context.objectId$.pipe(
      switchMap(objectId => $resolveState.get(context.vine)(objectId)),
  );
}
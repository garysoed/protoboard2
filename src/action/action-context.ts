import {$resolveState, Vine} from 'grapevine';
import {StateId} from 'gs-tools/export/state';
import {Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {ObjectSpec} from '../types/object-spec';


export interface ActionContext<O extends ObjectSpec<any>, C> {
  readonly config$: Observable<C>
  readonly objectId$: Observable<StateId<O>|null>;
  readonly vine: Vine;
}

export function getObject$<O extends ObjectSpec<any>, C>(context: ActionContext<O, C>): Observable<O|undefined> {
  return context.objectId$.pipe(
      switchMap(objectId => $resolveState.get(context.vine)(objectId)),
  );
}
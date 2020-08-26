import { Observable } from 'rxjs';
import { switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { ActionContext, BaseAction } from '../core/base-action';
import { ACTIVE_ID, ActivePayload } from '../region/active';
import { $stateService } from '../state/state-service';


export interface DroppablePayload {
  readonly contentIds: readonly string[];
}

export class DropAction extends BaseAction<DroppablePayload> {
  constructor(context: ActionContext<DroppablePayload>) {
    super(
        'Drop',
        'drop',
        {},
        context,
    );

    this.addSetup(this.handleTrigger$);
  }

  private get handleTrigger$(): Observable<unknown> {
    const stateService$ = $stateService.get(this.context.personaContext.vine);
    const activeState$ = stateService$.pipe(
        switchMap(service => service.getState<ActivePayload>(ACTIVE_ID)),
    );

    return this.onTrigger$
        .pipe(
            withLatestFrom(this.context.state$, activeState$),
            tap(([, state, activeState]) => {
              if (!activeState || !state) {
                return;
              }

              const activeContentIds$ = activeState.payload.contentIds;
              const oldActiveIds = [...activeContentIds$.getValue()];
              const movedId = oldActiveIds.pop();
              if (!movedId) {
                return;
              }

              activeContentIds$.next([...oldActiveIds]);

              const targetContentIds$ = state.payload.contentIds;
              const newTargetIds = [...targetContentIds$.getValue(), movedId];
              state.payload.contentIds.next(newTargetIds);
            }),
        );
  }
}

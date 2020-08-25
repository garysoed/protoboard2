import { Vine } from 'grapevine';
import { PersonaContext } from 'persona';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { BaseAction } from '../core/base-action';
import { ACTIVE_ID, ActivePayload } from '../region/active';
import { $stateService } from '../state/state-service';

export interface DroppablePayload {
  readonly contentIds: readonly string[];
}

export class DropAction extends BaseAction {
  constructor(context: PersonaContext) {
    super(
        'Drop',
        'drop',
        {},
        context,
    );

    this.addSetup(this.handleTrigger$);
  }

  private get handleTrigger$(): Observable<unknown> {
    const stateService$ = $stateService.get(this.context.vine);
    const activeState$ = stateService$.pipe(
        map(service => service.getState<ActivePayload>(ACTIVE_ID)),
    );
    const targetState$ = combineLatest([
      this.objectId$,
      stateService$,
    ])
    .pipe(
        map(([objectId, stateService]) => {
          return stateService.getState<DroppablePayload>(objectId) || null;
        }),
    );

    return this.onTrigger$
        .pipe(
            withLatestFrom(targetState$, activeState$),
            tap(([, targetState, activeState]) => {
              if (!activeState || !targetState) {
                return;
              }

              const activeContentIds$ = activeState.payload.contentIds;
              const oldActiveIds = [...activeContentIds$.getValue()];
              const movedId = oldActiveIds.pop();
              if (!movedId) {
                return;
              }

              activeContentIds$.next([...oldActiveIds]);

              const targetContentIds$ = targetState.payload.contentIds;
              const newTargetIds = [...targetContentIds$.getValue(), movedId];
              targetState.payload.contentIds.next(newTargetIds);
            }),
        );
  }
}

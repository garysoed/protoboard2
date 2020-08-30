import { EMPTY, Observable, of as observableOf } from 'rxjs';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';

import { ActionContext, BaseAction } from '../core/base-action';
import { ACTIVE_ID, ActivePayload } from '../region/active';
import { $stateService } from '../state/state-service';

import { DroppablePayload } from './payload/droppable-payload';
import { MovablePayload } from './payload/movable-payload';
import { moveObject } from './util/move-object';


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
    const movedObjectState$ = stateService$.pipe(
        switchMap(service => {
          return service.getState<ActivePayload>(ACTIVE_ID).pipe(
              switchMap(activeState => {
                if (!activeState) {
                  return observableOf(null);
                }

                return activeState.payload.contentIds;
              }),
              map(activeContentIds => {
                if (!activeContentIds) {
                  return null;
                }

                return [...activeContentIds].pop() || null;
              }),
              switchMap(movedId => {
                if (!movedId) {
                  return observableOf(null);
                }

                return service.getState<MovablePayload>(movedId);
              }),
          );
        }),
    );

    return this.onTrigger$
        .pipe(
            withLatestFrom(movedObjectState$, this.context.state$),
            switchMap(([, movedObjectState, destinationObjectState]) => {
              if (!movedObjectState) {
                return EMPTY;
              }

              return moveObject(
                  movedObjectState,
                  destinationObjectState,
                  this.context.personaContext.vine,
              );
            }),
        );
  }
}
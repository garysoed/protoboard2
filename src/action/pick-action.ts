import { cache } from 'gs-tools/export/data';
import { EMPTY, Observable } from 'rxjs';
import { switchMap, withLatestFrom } from 'rxjs/operators';

import { ActionContext, BaseAction } from '../core/base-action';
import { ACTIVE_ID, ActivePayload } from '../region/active';
import { $stateService } from '../state/state-service';

import { MovablePayload } from './payload/movable-payload';
import { moveObject } from './util/move-object';


/**
 * Lets the user pick up the object.
 *
 * @thModule action
 */
export class PickAction extends BaseAction<MovablePayload> {
  /**
   * @internal
   */
  constructor(context: ActionContext<MovablePayload>) {
    super(
        'pick',
        'Pick',
        {},
        context,
        {},
    );

    this.addSetup(this.handleTrigger$);
  }

  @cache()
  private get handleTrigger$(): Observable<unknown> {
    const activeState$ = $stateService.get(this.context.personaContext.vine).pipe(
        switchMap(service => service.getState<ActivePayload>(ACTIVE_ID)),
    );
    return this.onTrigger$
        .pipe(
            withLatestFrom(this.context.state$, activeState$),
            switchMap(([, state, activeState]) => {
              if (!activeState) {
                return EMPTY;
              }

              return moveObject(
                  state,
                  activeState,
                  this.context.personaContext.vine,
                  0,
              );
            }),
        );
  }
}

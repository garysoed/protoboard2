import { cache } from 'gs-tools/export/data';
import { Observable } from 'rxjs';
import { switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { ActionContext, BaseAction } from '../core/base-action';
import { ACTIVE_ID, ActivePayload } from '../region/active';
import { $stateService } from '../state/state-service';


/**
 * Lets the user pick up the object.
 *
 * @thModule action
 */
export class PickAction extends BaseAction<{}> {
  /**
   * @internal
   */
  constructor(context: ActionContext<{}>) {
    super(
        'pick',
        'Pick',
        {},
        context,
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
            withLatestFrom(this.context.objectId$, activeState$),
            tap(([, objectId, activeState]) => {
              if (!activeState) {
                return;
              }

              const existingContentIds = activeState.payload.contentIds.getValue();
              activeState.payload.contentIds.next([...existingContentIds, objectId]);
            }),
        );
  }
}

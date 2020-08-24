import { cache } from 'gs-tools/export/data';
import { PersonaContext } from 'persona';
import { Observable } from 'rxjs';
import { map, tap, withLatestFrom } from 'rxjs/operators';

import { BaseAction } from '../core/base-action';
import { ACTIVE_ID, ActivePayload } from '../region/active';
import { $stateService } from '../state/state-service';


/**
 * Lets the user pick up the object.
 *
 * @thModule action
 */
export class PickAction extends BaseAction {
  /**
   * @internal
   */
  constructor(context: PersonaContext) {
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
    const activeState$ = $stateService.get(this.context.vine).pipe(
        map(service => service.getState<ActivePayload>(ACTIVE_ID)),
    );
    return this.onTrigger$
        .pipe(
            withLatestFrom(this.objectId$, activeState$),
            tap(([, itemId, activeState]) => {
              if (!activeState) {
                return;
              }

              const existingObjectIds = activeState.payload.objectIds.getValue();
              activeState.payload.objectIds.next([...existingObjectIds, itemId]);
            }),
        );
  }
}

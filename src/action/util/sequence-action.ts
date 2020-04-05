import { Vine } from 'grapevine';
import { Observable } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { BaseAction } from '../../core/base-action';


/**
 * Runs a sequence of actions.
 */
export class SequenceAction extends BaseAction {
  constructor(
      actionKey: string,
      actionDesc: string,
      private readonly actions: readonly BaseAction[],
      vine: Vine,
  ) {
    super(actionKey, actionDesc, {}, vine);

    this.addSetup(this.setupActionTarget());
    this.addSetup(this.setupHandleTrigger());
    this.setupSubactions();
  }

  private setupActionTarget(): Observable<unknown> {
    return this.actionTarget$
        .pipe(
            tap(actionTarget => {
              for (const action of this.actions) {
                action.setActionTarget(actionTarget);
              }
            }),
        );
  }

  private setupHandleTrigger(): Observable<unknown> {
    return this.onTrigger$
        .pipe(
            tap(() => {
              for (const action of this.actions) {
                action.trigger();
              }
            }),
        );
  }

  private setupSubactions(): void {
    for (const action of this.actions) {
      this.addSetup(action.run());
    }
  }
}

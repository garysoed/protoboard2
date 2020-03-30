import { Vine } from 'grapevine';
import { takeUntil } from 'rxjs/operators';

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

    this.setupActionTarget();
    this.setupHandleTrigger();
  }

  private setupActionTarget(): void {
    this.actionTarget$
        .pipe(takeUntil(this.onDispose$))
        .subscribe(actionTarget => {
          for (const action of this.actions) {
            action.setActionTarget(actionTarget);
          }
        });
  }

  private setupHandleTrigger(): void {
    this.onTrigger$
        .pipe(takeUntil(this.onDispose$))
        .subscribe(() => {
          for (const action of this.actions) {
            action.trigger();
          }
        });
  }
}

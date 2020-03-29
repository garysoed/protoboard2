import { Vine } from 'grapevine';
import { takeUntil, withLatestFrom } from 'rxjs/operators';

import { BaseAction } from '../core/base-action';
import { TriggerSpec } from '../core/trigger-spec';

import { $helpService } from './help-service';


export class HelpAction extends BaseAction {
  constructor(
      private readonly actions: ReadonlyMap<TriggerSpec, BaseAction>,
      vine: Vine,
  ) {
    super(
        'help',
        'Help',
        {},
        vine,
    );

    this.setupHandleTrigger();
  }

  private setupHandleTrigger(): void {
    const helpService$ = $helpService.get(this.vine);
    this.onTrigger$
        .pipe(
            withLatestFrom(helpService$),
            takeUntil(this.onDispose$),
        )
        .subscribe(([, helpService]) => {
          helpService.show(this.actions);
        });
  }
}

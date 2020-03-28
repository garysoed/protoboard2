import { PersonaContext } from 'persona';
import { takeUntil, withLatestFrom } from 'rxjs/operators';

import { BaseAction } from '../core/base-action';
import { TriggerKey, TriggerType } from '../core/trigger-spec';

import { $helpService } from './help-service';


export class HelpAction extends BaseAction {
  constructor(
      private readonly actions: Iterable<BaseAction>,
      context: PersonaContext,
  ) {
    super(
        'help',
        'Help',
        {},
        {type: TriggerType.KEY, key: TriggerKey.QUESTION},
        context,
    );

    this.setupHandleTrigger();
  }

  private setupHandleTrigger(): void {
    this.onTrigger$
        .pipe(
            withLatestFrom($helpService.get(this.vine)),
            takeUntil(this.onDispose$),
        )
        .subscribe(([, helpService]) => {
          helpService.show(this.actions);
        });
  }
}

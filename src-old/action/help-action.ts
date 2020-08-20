import { Vine } from 'grapevine';
import { Observable } from 'rxjs';
import { tap, withLatestFrom } from 'rxjs/operators';

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

    this.addSetup(this.setupHandleTrigger());
  }

  private setupHandleTrigger(): Observable<unknown> {
    const helpService$ = $helpService.get(this.vine);
    return this.onTrigger$
        .pipe(
            withLatestFrom(helpService$),
            tap(([, helpService]) => {
              helpService.show(this.actions);
            }),
        );
  }
}

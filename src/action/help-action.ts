import {Observable} from 'rxjs';
import {tap, withLatestFrom} from 'rxjs/operators';

import {ActionContext, BaseAction} from '../core/base-action';
import {TriggerSpec} from '../core/trigger-spec';

import {$helpService} from './help-service';


export class HelpAction extends BaseAction<{}> {
  constructor(
      context: ActionContext<any>,
      private readonly actions: ReadonlyMap<TriggerSpec, BaseAction<any>>,
  ) {
    super(
        'help',
        'Help',
        {},
        context,
        {},
    );

    this.addSetup(this.setupHandleTrigger());
  }

  private setupHandleTrigger(): Observable<unknown> {
    const helpService$ = $helpService.get(this.context.personaContext.vine);
    return this.onTrigger$
        .pipe(
            withLatestFrom(helpService$),
            tap(([, helpService]) => {
              helpService.show(this.actions);
            }),
        );
  }
}

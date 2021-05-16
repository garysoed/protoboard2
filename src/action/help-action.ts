import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

import {ActionContext, BaseAction} from '../core/base-action';
import {TriggerSpec} from '../core/trigger-spec';
import {ObjectSpec} from '../types/object-spec';

import {$helpService} from './help-service';


export class HelpAction extends BaseAction<ObjectSpec<any>> {
  constructor(
      context: ActionContext<any, {}>,
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
    const helpService = $helpService.get(this.vine);
    return this.onTrigger$
        .pipe(
            tap(() => {
              helpService.show(this.actions);
            }),
        );
  }
}

import {OperatorFunction, pipe} from 'rxjs';
import {tap} from 'rxjs/operators';

import {ActionContext, BaseAction, TriggerEvent} from '../core/base-action';
import {TriggerSpec} from '../core/trigger-spec';
import {ObjectSpec} from '../types/object-spec';

import {$helpService} from './help-service';


export class HelpAction extends BaseAction<ObjectSpec<any>, {}> {
  constructor(
      context: ActionContext,
      private readonly actions: ReadonlyMap<TriggerSpec, BaseAction<any, unknown>>,
  ) {
    super(
        'help',
        'Help',
        {},
        context,
    );
  }

  getOperator(): OperatorFunction<TriggerEvent, unknown> {
    return pipe(
        tap(() => {
          $helpService.get(this.vine).show(this.actions);
        }),
    );
  }
}

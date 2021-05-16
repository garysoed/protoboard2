import {OperatorFunction, pipe} from 'rxjs';
import {tap} from 'rxjs/operators';

import {BaseAction, OperatorContext, TriggerEvent} from '../core/base-action';
import {TriggerSpec} from '../core/trigger-spec';
import {ObjectSpec} from '../types/object-spec';

import {$helpService} from './help-service';


export class HelpAction extends BaseAction<ObjectSpec<any>, {}> {
  constructor(
      private readonly actions: ReadonlyMap<TriggerSpec, BaseAction<any, unknown>>,
  ) {
    super(
        'help',
        'Help',
        {},
    );
  }

  getOperator(context: OperatorContext<ObjectSpec<any>, {}>): OperatorFunction<TriggerEvent, unknown> {
    return pipe(
        tap(() => {
          $helpService.get(context.vine).show(this.actions);
        }),
    );
  }
}

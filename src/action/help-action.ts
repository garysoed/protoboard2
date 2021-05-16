import {cache} from 'gs-tools/export/data';
import {OperatorFunction, pipe} from 'rxjs';
import {tap} from 'rxjs/operators';

import {ActionContext, BaseAction, TriggerEvent} from '../core/base-action';
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
  }

  @cache()
  get operator(): OperatorFunction<TriggerEvent, unknown> {
    return pipe(
        tap(() => {
          $helpService.get(this.vine).show(this.actions);
        }),
    );
  }
}

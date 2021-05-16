import {cache} from 'gs-tools/export/data';
import {NEVER, OperatorFunction} from 'rxjs';
import {switchMapTo} from 'rxjs/operators';

import {ActionContext, BaseAction, TriggerEvent} from '../core/base-action';
import {ContainerSpec} from '../types/container-spec';


export class ShuffleAction extends BaseAction<ContainerSpec<unknown, 'indexed'>, {}> {
  constructor(context: ActionContext) {
    super(
        'shuffle',
        'Shuffle',
        {},
        context,
    );
  }

  @cache()
  getOperator(): OperatorFunction<TriggerEvent, unknown> {
    return switchMapTo(NEVER);
  }
}

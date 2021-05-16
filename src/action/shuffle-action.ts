import {cache} from 'gs-tools/export/data';
import {NEVER, OperatorFunction} from 'rxjs';
import {switchMapTo} from 'rxjs/operators';

import {BaseAction, TriggerEvent} from '../core/base-action';
import {ContainerSpec} from '../types/container-spec';


export class ShuffleAction extends BaseAction<ContainerSpec<unknown, 'indexed'>, {}> {
  constructor() {
    super('shuffle', 'Shuffle', {});
  }

  @cache()
  getOperator(): OperatorFunction<TriggerEvent, unknown> {
    return switchMapTo(NEVER);
  }
}

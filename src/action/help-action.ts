import {$asMap, $map, $pipe} from 'gs-tools/export/collect';
import {OperatorFunction, pipe} from 'rxjs';
import {tap} from 'rxjs/operators';

import {ActionContext, BaseAction, TriggerEvent} from '../core/base-action';
import {DetailedTriggerSpec, TriggerType} from '../core/trigger-spec';
import {ObjectSpec} from '../types/object-spec';

import {ActionSpec} from './action-spec';
import {$helpService} from './help-service';


interface NormalizedActionSpec extends Omit<ActionSpec<{}>, 'trigger'> {
  readonly trigger: DetailedTriggerSpec<TriggerType>;
}

export class HelpAction extends BaseAction<ObjectSpec<any>, {}> {
  constructor(
      private readonly actionsArray: readonly NormalizedActionSpec[],
  ) {
    super('help', 'Help', {});
  }

  getOperator(context: ActionContext<ObjectSpec<any>, {}>): OperatorFunction<TriggerEvent, unknown> {
    return pipe(
        tap(() => {
          $helpService.get(context.vine).show($pipe(
              this.actionsArray,
              $map(spec => [spec.trigger, spec.action] as const),
              $asMap(),
          ));
        }),
    );
  }
}

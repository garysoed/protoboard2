import {$asMap, $map, $pipe} from 'gs-tools/export/collect';
import {OperatorFunction, pipe} from 'rxjs';
import {tap} from 'rxjs/operators';

import {BaseAction} from '../core/base-action';
import {TriggerEvent} from '../core/trigger-event';
import {DetailedTriggerSpec, TriggerType} from '../core/trigger-spec';
import {ObjectSpec} from '../types/object-spec';

import {ActionContext} from './action-context';
import {ActionSpec} from './action-spec';
import {$helpService} from './help-service';


interface NormalizedActionSpec extends Omit<ActionSpec<{}>, 'trigger'> {
  readonly trigger: DetailedTriggerSpec<TriggerType>;
}

class HelpAction extends BaseAction<ObjectSpec<any>, {}> {
  constructor(
      private readonly actionsArray: readonly NormalizedActionSpec[],
  ) {
    super();
  }

  getOperator(context: ActionContext<ObjectSpec<any>, {}>): OperatorFunction<TriggerEvent, unknown> {
    return pipe(
        tap(() => {
          $helpService.get(context.vine).show($pipe(
              this.actionsArray,
              $map(spec => [spec.trigger, spec.actionName] as const),
              $asMap(),
          ));
        }),
    );
  }
}

export function helpAction(
    actions: readonly NormalizedActionSpec[],
): NormalizedActionSpec {
  return {
    action: new HelpAction(actions),
    actionName: 'Help',
    configSpecs: {},
    defaultConfig: {},
    trigger: {type: TriggerType.QUESTION, shift: true},
  };
}

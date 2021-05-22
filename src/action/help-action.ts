import {$asMap, $map, $pipe} from 'gs-tools/export/collect';
import {OperatorFunction, pipe} from 'rxjs';
import {tap} from 'rxjs/operators';

import {TriggerEvent} from '../core/trigger-event';
import {DetailedTriggerSpec, TriggerType} from '../core/trigger-spec';
import {ObjectSpec} from '../types/object-spec';

import {ActionContext} from './action-context';
import {ActionSpec} from './action-spec';
import {$helpService} from './help-service';


interface NormalizedActionSpec extends Omit<ActionSpec<{}>, 'trigger'> {
  readonly trigger: DetailedTriggerSpec<TriggerType>;
}

function action(
    actionsArray: readonly NormalizedActionSpec[],
    context: ActionContext<ObjectSpec<any>, {}>,
): OperatorFunction<TriggerEvent, unknown> {
  return pipe(
      tap(() => {
        $helpService.get(context.vine).show($pipe(
            actionsArray,
            $map(spec => [spec.trigger, spec.actionName] as const),
            $asMap(),
        ));
      }),
  );
}

export function helpAction(
    actions: readonly NormalizedActionSpec[],
): NormalizedActionSpec {
  return {
    action: context => action(actions, context),
    actionName: 'Help',
    configSpecs: {},
    trigger: {type: TriggerType.QUESTION, shift: true},
  };
}

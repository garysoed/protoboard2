import {Vine} from 'grapevine';
import {$asMap, $map, $pipe} from 'gs-tools/export/collect';
import {constantIn} from 'persona';
import {Observable, of, OperatorFunction, pipe} from 'rxjs';
import {tap, withLatestFrom} from 'rxjs/operators';

import {TriggerEvent} from '../core/trigger-event';
import {DetailedTriggerSpec, TriggerType} from '../core/trigger-spec';

import {Action, ConfigSpecs} from './action-spec';
import {$helpService} from './help-service';


interface ActionDescription {
  readonly actionName: string;
  readonly trigger: DetailedTriggerSpec<TriggerType>;
}


export interface Config {
  readonly trigger: DetailedTriggerSpec<TriggerType>;
}

function action(
    actionDescriptions$: Observable<readonly ActionDescription[]>,
    vine: Vine,
): OperatorFunction<TriggerEvent, unknown> {
  return pipe(
      withLatestFrom(actionDescriptions$),
      tap(([, actionDescriptions]) => {
        $helpService.get(vine).show($pipe(
            actionDescriptions,
            $map(description => [description.trigger, description.actionName] as const),
            $asMap(),
        ));
      }),
  );
}

export interface HelpActionSpec {
  readonly action: Action<any, Config>;
  readonly actionName: string;
  readonly configSpecs: ConfigSpecs<Config>;
}

export function helpAction(
    actionDescriptions$: Observable<readonly ActionDescription[]>,
): HelpActionSpec {
  return {
    action: context => action(actionDescriptions$, context.vine),
    actionName: 'Help',
    configSpecs: {
      trigger: constantIn(of({type: TriggerType.QUESTION, shift: true})),
    },
  };
}

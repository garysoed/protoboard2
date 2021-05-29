import {Vine} from 'grapevine';
import {constantIn, host} from 'persona';
import {Observable, of, OperatorFunction, pipe} from 'rxjs';
import {tap, withLatestFrom} from 'rxjs/operators';

import {TriggerEvent} from '../core/trigger-event';
import {DetailedTriggerSpec, TriggerType} from '../core/trigger-spec';

import {Action, ConfigSpecs} from './action-spec';
import {$helpService, ActionTrigger} from './help-service';


export interface Config {
  readonly trigger: DetailedTriggerSpec<TriggerType>;
}

function action(
    actionTriggers$: Observable<readonly ActionTrigger[]>,
    vine: Vine,
): OperatorFunction<TriggerEvent, unknown> {
  return pipe(
      withLatestFrom(actionTriggers$),
      tap(([, actionDescriptions]) => {
        $helpService.get(vine).show(actionDescriptions);
      }),
  );
}

export interface HelpActionSpec {
  readonly action: Action<any, Config>;
  readonly actionName: string;
  readonly configSpecs: ConfigSpecs<Config>;
}

export function helpAction(
    actionTriggers$: Observable<readonly ActionTrigger[]>,
): HelpActionSpec {
  return {
    action: context => action(actionTriggers$, context.vine),
    actionName: 'Help',
    configSpecs: host({
      trigger: constantIn(of({type: TriggerType.QUESTION, shift: true})),
    })._,
  };
}

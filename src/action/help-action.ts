import {constantIn, host} from 'persona';
import {Observable, of} from 'rxjs';
import {tap, withLatestFrom} from 'rxjs/operators';

import {TriggerSpec, TriggerType} from '../core/trigger-spec';

import {Action, ConfigSpecs} from './action-spec';
import {$helpService, ActionTrigger} from './help-service';
import {createTrigger} from './util/setup-trigger';


export interface Config {
  readonly trigger: TriggerSpec;
}

function actionFactory(
    configSpecs: ConfigSpecs<Config>,
    actionTriggers$: Observable<readonly ActionTrigger[]>,
): Action<{}> {
  return context => {
    return createTrigger(configSpecs, context.personaContext).pipe(
        withLatestFrom(actionTriggers$),
        tap(([, actionDescriptions]) => {
          $helpService.get(context.personaContext.vine).show(actionDescriptions);
        }),
    );
  };
}

export interface HelpActionSpec {
  readonly action: Action<any>;
  readonly actionName: string;
  readonly configSpecs: ConfigSpecs<Config>;
}

export function helpAction(
    actionTriggers$: Observable<readonly ActionTrigger[]>,
): HelpActionSpec {
  const configSpecs = host({
    trigger: constantIn(of({type: TriggerType.QUESTION, shift: true})),
  })._;
  return {
    action: actionFactory(configSpecs, actionTriggers$),
    actionName: 'Help',
    configSpecs,
  };
}

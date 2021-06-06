import {Observable, of} from 'rxjs';
import {tap, withLatestFrom} from 'rxjs/operators';

import {TriggerSpec, TriggerType} from '../core/trigger-spec';

import {Action} from './action-spec';
import {$helpService, ActionTrigger} from './help-service';
import {createTrigger} from './util/setup-trigger';


export interface Config {
  readonly trigger: TriggerSpec;
}

function actionFactory(
    config$: Observable<Config>,
    actionTriggers$: Observable<readonly ActionTrigger[]>,
): Action<{}> {
  return context => {
    return config$.pipe(
        createTrigger(context.personaContext),
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
  readonly config$: Observable<Config>;
}

export function helpAction(
    actionTriggers$: Observable<readonly ActionTrigger[]>,
): HelpActionSpec {
  const config$ = of({trigger: {type: TriggerType.QUESTION, shift: true}});
  return {
    action: actionFactory(config$, actionTriggers$),
    actionName: 'Help',
    config$,
  };
}

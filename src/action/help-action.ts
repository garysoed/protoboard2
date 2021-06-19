import {PersonaContext} from 'persona';
import {Observable, of, pipe} from 'rxjs';
import {tap, withLatestFrom} from 'rxjs/operators';

import {TriggerEvent} from '../core/trigger-event';
import {TriggerSpec, TriggerType} from '../core/trigger-spec';

import {Action} from './action-spec';
import {$helpService, ActionTrigger} from './help-service';
import {createTrigger} from './util/setup-trigger';


export interface Config {
  readonly trigger: TriggerSpec;
}

function actionFactory(
    actionTriggers$: Observable<readonly ActionTrigger[]>,
    personaContext: PersonaContext,
): Action {
  return pipe(
      withLatestFrom(actionTriggers$),
      tap(([, actionDescriptions]) => {
        $helpService.get(personaContext.vine).show(actionDescriptions);
      }),
  );
}

export interface HelpActionSpec {
  readonly action: Action;
  readonly actionName: string;
  readonly config$: Observable<Config>;
  readonly trigger$: Observable<TriggerEvent>;
}

export function helpAction(
    actionTriggers$: Observable<readonly ActionTrigger[]>,
    context: PersonaContext,
): HelpActionSpec {
  const config$ = of({trigger: {type: TriggerType.QUESTION, shift: true}});
  return {
    action: actionFactory(actionTriggers$, context),
    actionName: 'Help',
    config$,
    trigger$: config$.pipe(createTrigger(context)),
  };
}

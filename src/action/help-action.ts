import {PersonaContext} from 'persona';
import {Observable, of, pipe} from 'rxjs';
import {map, tap, withLatestFrom} from 'rxjs/operators';

import {TriggerSpec, TriggerType} from '../core/trigger-spec';

import {Action, ActionSpec} from './action-spec';
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

export function helpAction(
    actionTriggers$: Observable<readonly ActionTrigger[]>,
    context: PersonaContext,
): ActionSpec {
  const config$ = of({trigger: {type: TriggerType.QUESTION, shift: true}});
  return {
    action: actionFactory(actionTriggers$, context),
    actionName: 'Help',
    triggerSpec$: config$.pipe(map(({trigger}) => trigger)),
    trigger$: config$.pipe(createTrigger(context)),
  };
}

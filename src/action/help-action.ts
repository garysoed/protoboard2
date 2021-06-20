import {pipe} from 'rxjs';
import {tap, withLatestFrom} from 'rxjs/operators';

import {TriggerSpec} from '../core/trigger-spec';

import {Action, ActionParams} from './action-spec';
import {$helpService, ActionTrigger} from './help-service';


export interface Config {
  readonly actionTriggers: readonly ActionTrigger[];
  readonly trigger: TriggerSpec;
}

export function helpAction({config$, context}: ActionParams<Config, {}>): Action {
  return pipe(
      withLatestFrom(config$),
      tap(([, config]) => {
        $helpService.get(context.vine).show(config.actionTriggers);
      }),
  );
}

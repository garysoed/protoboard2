import {pipe} from 'rxjs';
import {tap, withLatestFrom} from 'rxjs/operators';

import {TriggerSpec} from '../core/trigger-spec';

import {Action, ActionParams} from './action-spec';
import {$helpService, ActionTrigger} from './help-service';


export interface Config {
  readonly actionTriggers: readonly ActionTrigger[];
  readonly trigger: TriggerSpec;
}

export function helpAction({config$, vine}: ActionParams<Config, {}>): Action {
  return pipe(
      withLatestFrom(config$),
      tap(([, config]) => {
        $helpService.get(vine).show(config.actionTriggers);
      }),
  );
}

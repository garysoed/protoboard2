import {fromEvent, pipe} from 'rxjs';
import {startWith, switchMap, tap, withLatestFrom} from 'rxjs/operators';

import {TriggerSpec} from '../core/trigger-spec';

import {Action, ActionParams} from './action-spec';
import {HelpContent, ShowHelpEvent, SHOW_HELP_EVENT} from './help-service';


export interface Config {
  readonly helpContent: HelpContent;
  readonly targetEl: Element;
  readonly trigger: TriggerSpec;
}

export function helpAction({config$}: ActionParams<Config, {}>): Action {
  const addContent$ = config$.pipe(
      switchMap(config => {
        return fromEvent<ShowHelpEvent>(config.targetEl, SHOW_HELP_EVENT).pipe(
            tap(event => {
              event.add(config.helpContent);
            }),
            startWith({}),
        );
      }),
  );
  return pipe(
      withLatestFrom(config$, addContent$),
      tap(([, config]) => {
        config.targetEl.dispatchEvent(new ShowHelpEvent());
      }),
  );
}

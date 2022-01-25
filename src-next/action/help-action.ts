import {Context, ievent} from 'persona';
import {Observable, OperatorFunction, pipe} from 'rxjs';
import {switchMap, tap, withLatestFrom} from 'rxjs/operators';

import {BaseComponentSpecType} from '../core/base-component';
import {TriggerEvent} from '../trigger/trigger-event';

import {HelpContent, ShowHelpEvent, SHOW_HELP_EVENT} from './show-help-event';


export interface HelpActionConfig {
  readonly helpContent: HelpContent;
}

export function helpAction(
    $: Context<BaseComponentSpecType<unknown>>,
    config$: Observable<HelpActionConfig>,
): OperatorFunction<TriggerEvent, unknown> {
  return pipe(
      withLatestFrom(config$),
      tap(([, config]) => {
        $.element.dispatchEvent(new ShowHelpEvent([config.helpContent]));
      }),
  );
}


export function forwardHelpEvent(
    config$: Observable<HelpActionConfig>,
): OperatorFunction<HTMLElement, unknown> {
  return pipe(
      switchMap(element => ievent(SHOW_HELP_EVENT, ShowHelpEvent, {matchTarget: false})
          .resolve(element)
          .value$),
      withLatestFrom(config$),
      tap(([event, config]) => {
        event.addContent(config.helpContent);
      }),
  );
}
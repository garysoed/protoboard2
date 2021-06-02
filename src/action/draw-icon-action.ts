import {$stateService} from 'grapevine';
import {$asArray, $filter, $find, $pipe} from 'gs-tools/export/collect';
import {OperatorFunction, pipe} from 'rxjs';
import {switchMap, tap, withLatestFrom} from 'rxjs/operators';

import {TriggerEvent} from '../core/trigger-event';
import {CanvasEntry} from '../face/canvas-entry';

import {ActionContext, getObject$} from './action-context';
import {ActionSpec, ConfigSpecs, TriggerConfig} from './action-spec';


export interface Config extends TriggerConfig {
  readonly x: number;
  readonly y: number;
  readonly configName: string;
}

function action(context: ActionContext<CanvasEntry, Config>): OperatorFunction<TriggerEvent, unknown> {
  const stateService = $stateService.get(context.vine);
  const entry$ = getObject$(context);
  const icons$ = entry$.pipe(
      switchMap(entry => {
        return stateService.resolve(entry?.icons);
      }),
  );
  return pipe(
      withLatestFrom(entry$, icons$, context.config$),
      tap(([, entry, icons, config]) => {
        if (!entry) {
          return;
        }

        const existingIcons = icons ?? [];

        const existingEntry = $pipe(
            existingIcons,
            $find(icon => {
              return icon.configName === config.configName
                  && icon.x === config.x
                  && icon.y === config.y;
            }),
        );

        stateService.modify(x => {
          if (!existingEntry) {
            x.set(entry.icons, [...existingIcons, config]);
            return;
          }

          x.set(
              entry.icons,
              $pipe(existingIcons, $filter(icon => icon !== existingEntry), $asArray()),
          );
        });
      }),
  );
}

export function drawIconAction(
    configSpecs: ConfigSpecs<Config>,
    actionName: string,
): ActionSpec<Config> {
  return {
    action,
    actionName,
    configSpecs,
  };
}
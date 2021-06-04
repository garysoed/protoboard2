import {$stateService} from 'grapevine';
import {$asArray, $filter, $find, $pipe} from 'gs-tools/export/collect';
import {switchMap, tap, withLatestFrom} from 'rxjs/operators';

import {CanvasEntry} from '../face/canvas-entry';

import {getObject$} from './action-context';
import {Action, ActionSpec, ConfigSpecs, TriggerConfig} from './action-spec';
import {createTrigger} from './util/setup-trigger';


export interface Config extends TriggerConfig {
  readonly x: number;
  readonly y: number;
  readonly configName: string;
}

function actionFactory(configSpecs: ConfigSpecs<Config>): Action<CanvasEntry> {
  return context => {
    const stateService = $stateService.get(context.vine);
    const entry$ = getObject$(context);
    const icons$ = entry$.pipe(
        switchMap(entry => {
          return stateService.resolve(entry?.icons);
        }),
    );
    return createTrigger(configSpecs, context.personaContext).pipe(
        withLatestFrom(entry$, icons$),
        tap(([{config}, entry, icons]) => {
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
  };
}

export function drawIconAction(
    configSpecs: ConfigSpecs<Config>,
    actionName: string,
): ActionSpec<Config> {
  return {
    action: actionFactory(configSpecs),
    actionName,
    configSpecs,
  };
}
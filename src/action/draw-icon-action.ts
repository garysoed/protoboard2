import {$stateService} from 'grapevine';
import {$asArray, $filter, $find, $pipe} from 'gs-tools/export/collect';
import {PersonaContext} from 'persona';
import {Observable} from 'rxjs';
import {switchMap, tap, withLatestFrom} from 'rxjs/operators';

import {CanvasEntry} from '../face/canvas-entry';

import {getObject$} from './action-context';
import {Action, ActionSpec, TriggerConfig} from './action-spec';
import {createTrigger} from './util/setup-trigger';


export interface Config extends TriggerConfig {
  readonly x: number;
  readonly y: number;
  readonly configName: string;
}

function actionFactory(config$: Observable<Config>): Action<CanvasEntry> {
  return context => {
    const stateService = $stateService.get(context.personaContext.vine);
    const entry$ = getObject$(context);
    const icons$ = entry$.pipe(
        switchMap(entry => {
          return stateService.resolve(entry?.icons);
        }),
    );
    return config$.pipe(
        createTrigger(context.personaContext),
        withLatestFrom(config$, entry$, icons$),
        tap(([, config, entry, icons]) => {
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
    config$: Observable<Config>,
    actionName: string,
    context: PersonaContext,
): ActionSpec<CanvasEntry, Config> {
  return {
    action: actionFactory(config$),
    actionName,
    config$,
    trigger$: config$.pipe(createTrigger(context)),
  };
}
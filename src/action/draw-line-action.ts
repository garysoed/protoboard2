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
    const stateService = $stateService.get(context.personaContext.vine);
    const entry$ = getObject$(context);
    const lines$ = entry$.pipe(
        switchMap(entry => {
          return stateService.resolve(entry?.lines);
        }),
    );
    const halfLine$ = entry$.pipe(
        switchMap(entry => {
          return stateService.resolve(entry?.halfLine);
        }),
    );
    return createTrigger(configSpecs, context.personaContext).pipe(
        withLatestFrom(entry$, lines$, halfLine$),
        tap(([{config}, entry, lines, halfLine]) => {
          if (!entry) {
            return;
          }

          if (!halfLine) {
            stateService.modify(x => {
              x.set(
                  entry.halfLine,
                  {fromX: config.x, fromY: config.y, configName: config.configName},
              );
            });
            return;
          }

          const existingLines = lines ?? [];

          const existingEntry = $pipe(
              existingLines,
              $find(line => {
                if (line.configName !== config.configName) {
                  return false;
                }

                if (line.toX === config.x
                    && line.toY === config.y
                    && line.fromX === halfLine.fromX
                    && line.fromY === halfLine.fromY
                ) {
                  return true;
                }

                return line.fromX === config.x
                    && line.fromY === config.y
                    && line.toX === halfLine.fromX
                    && line.toY === halfLine.fromY;
              }),
          );

          stateService.modify(x => {
            const newEntry = {
              fromX: halfLine.fromX,
              fromY: halfLine.fromY,
              toX: config.x,
              toY: config.y,
              configName: config.configName,
            };
            x.set(entry.halfLine, null);

            if (newEntry.fromX === newEntry.toX && newEntry.fromY === newEntry.toY) {
              return;
            }

            if (halfLine.configName !== config.configName) {
              return;
            }

            if (!existingEntry) {
              x.set(entry.lines, [...existingLines, newEntry]);
              return;
            }

            x.set(
                entry.lines,
                $pipe(existingLines, $filter(line => line !== existingEntry), $asArray()),
            );
          });
        }),
    );
  };
}

export function drawLineAction(
    configSpecs: ConfigSpecs<Config>,
    actionName: string,
): ActionSpec<Config> {
  return {
    action: actionFactory(configSpecs),
    actionName,
    configSpecs,
  };
}
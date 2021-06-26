import {$resolveStateOp, $stateService} from 'grapevine';
import {$asArray, $filter, $find, $pipe} from 'gs-tools/export/collect';
import {pipe} from 'rxjs';
import {switchMap, tap, withLatestFrom} from 'rxjs/operators';

import {CanvasEntry} from '../face/canvas-entry';

import {Action, ActionParams, TriggerConfig} from './action-spec';


export interface Config extends TriggerConfig {
  readonly x: number;
  readonly y: number;
  readonly configName: string;
}

export function drawIconAction({config$, objectId$, vine}: ActionParams<Config, CanvasEntry>): Action {
  const stateService = $stateService.get(vine);
  const entry$ = objectId$.pipe($resolveStateOp.get(vine)());
  const icons$ = entry$.pipe(
      switchMap(entry => {
        return stateService.resolve(entry?.icons);
      }),
  );
  return pipe(
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
}
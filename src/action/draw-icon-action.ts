import {$stateService} from 'grapevine';
import {$asArray, $filter, $find, $pipe} from 'gs-tools/export/collect';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {pipe} from 'rxjs';
import {map, withLatestFrom} from 'rxjs/operators';

import {CanvasSpec} from '../face/canvas-entry';

import {Action, ActionParams, TriggerConfig} from './action-spec';


export interface Config extends TriggerConfig {
  readonly x: number;
  readonly y: number;
  readonly height: number;
  readonly width: number;
  readonly configName: string;
}

export function drawIconAction({config$, objectPath$, vine}: ActionParams<Config, CanvasSpec>): Action {
  const stateService = $stateService.get(vine);
  const icons$ = stateService._(objectPath$).$('icons');
  return pipe(
      withLatestFrom(config$, icons$),
      map(([, config, icons]) => {
        const existingIcons = icons ?? [];
        const existingEntry = $pipe(
            existingIcons,
            $find(icon => {
              return icon.configName === config.configName
                    && icon.x === config.x
                    && icon.y === config.y;
            }),
        );

        if (!existingEntry) {
          return [...existingIcons, config];
        }

        return $pipe(existingIcons, $filter(icon => icon !== existingEntry), $asArray());
      }),
      filterNonNullable(),
      icons$.set(),
  );
}
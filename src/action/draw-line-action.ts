import {$stateService} from 'grapevine';
import {$asArray, $filter, $find, $pipe} from 'gs-tools/export/collect';
import {filterNonNullable} from 'gs-tools/export/rxjs';
import {concat, of, pipe} from 'rxjs';
import {switchMap, withLatestFrom} from 'rxjs/operators';

import {CanvasHalfLine, CanvasLine, CanvasSpec} from '../face/canvas-entry';

import {Action, ActionParams, TriggerConfig} from './action-spec';


export interface Config extends TriggerConfig {
  readonly x: number;
  readonly y: number;
  readonly configName: string;
}

export function drawLineAction({config$, objectPath$, vine}: ActionParams<Config, CanvasSpec>): Action {
  const stateService = $stateService.get(vine);
  const entry = stateService._(objectPath$);
  const lines$ = entry.$('lines');
  const halfLine$ = entry.$('halfLine');

  return pipe(
      withLatestFrom(config$, halfLine$, lines$),
      switchMap(([, config, halfLine, lines]) => {
        const halfLineChange = getHalfLineChange(config, halfLine);
        const lineChange = getLinesChange(config, halfLine, lines);
        return concat(
            of(halfLineChange).pipe(halfLine$.set()),
            of(lineChange).pipe(filterNonNullable(), lines$.set()),
        );
      }),
  );
}

function getHalfLineChange(
    config: Config,
    halfLine: CanvasHalfLine|null|undefined,
): CanvasHalfLine|null {
  if (halfLine) {
    return null;
  }

  return {fromX: config.x, fromY: config.y, configName: config.configName};
}

function getLinesChange(
    config: Config,
    halfLine: CanvasHalfLine|null|undefined,
    lines: (readonly CanvasLine[])|undefined,
): (readonly CanvasLine[])|null {
  if (!halfLine) {
    return null;
  }

  const newEntry = {
    fromX: halfLine.fromX,
    fromY: halfLine.fromY,
    toX: config.x,
    toY: config.y,
    configName: config.configName,
  };

  if (newEntry.fromX === newEntry.toX && newEntry.fromY === newEntry.toY) {
    return null;
  }

  if (halfLine.configName !== config.configName) {
    return null;
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
  if (!existingEntry) {
    return [...existingLines, newEntry];
  }

  return $pipe(existingLines, $filter(line => line !== existingEntry), $asArray());
}
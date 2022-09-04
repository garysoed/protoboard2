import {flattenResolver} from 'gs-tools/export/state';
import {arrayOfType, hasPropertiesType, numberType} from 'gs-types';
import {Context} from 'persona';
import {merge, Observable, of, OperatorFunction, pipe} from 'rxjs';
import {mapTo, switchMap, withLatestFrom} from 'rxjs/operators';

import {BaseComponentSpecType} from '../../core/base-component';
import {TriggerEvent} from '../../trigger/trigger-event';

import {LineState, PadContentType, PadState} from './pad-state';


export interface LineActionInput {
  readonly x: number;
  readonly y: number;
}

export const LINE_ACTION_INPUT_TYPE = hasPropertiesType({
  x: numberType,
  y: numberType,
});

type LineAction = (context: Context<BaseComponentSpecType<PadState>>) => OperatorFunction<TriggerEvent|[LineActionInput], TriggerEvent|[LineActionInput]>;
interface Config {
  readonly lineId: string;
}

export function lineActionFactory(config: Config, target$: Observable<Element>): LineAction {
  return $ => {
    const contents$ = flattenResolver($.host.state).$('contents');
    const halfLine$ = flattenResolver($.host.state).$('halfLine');
    return pipe(
        withLatestFrom(contents$, halfLine$, target$),
        switchMap(([input, contents, halfLine, target]) => {
          const rect = target.getBoundingClientRect();
          const {x: xRaw, y: yRaw} = getLineLocation(input);
          const x = xRaw - rect.left;
          const y = yRaw - rect.top;
          if (halfLine === null || halfLine.lineId !== config.lineId) {
            const newHalfLine = {
              x1: x,
              y1: y,
              lineId: config.lineId,
            };
            return of(newHalfLine).pipe(halfLine$.set(), mapTo(input));
          }

          const lineState: LineState = {
            type: PadContentType.LINE,
            lineId: config.lineId,
            x1: halfLine.x1,
            y1: halfLine.y1,
            x2: x,
            y2: y,
          };

          const updateHalfLine$ = of(null).pipe(halfLine$.set());
          const updateContents$ = of([...contents, lineState]).pipe(contents$.set());
          return merge(updateHalfLine$, updateContents$).pipe(mapTo(input));
        }),
    );
  };
}

interface Location {
  readonly x: number;
  readonly y: number;
}

function getLineLocation(triggerOrInput: TriggerEvent|[LineActionInput]): Location {
  if (arrayOfType(LINE_ACTION_INPUT_TYPE).check(triggerOrInput)) {
    return triggerOrInput[0];
  }

  return {
    x: triggerOrInput.details.mouseClientX,
    y: triggerOrInput.details.mouseClientY,
  };
}
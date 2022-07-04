import {flattenResolver} from 'gs-tools/export/state';
import {arrayOfType, hasPropertiesType, intersectType, numberType, stringType, Type, unknownType} from 'gs-types';
import {Context} from 'persona';
import {merge, of, OperatorFunction, pipe} from 'rxjs';
import {mapTo, switchMap, withLatestFrom} from 'rxjs/operators';

import {BaseComponentSpecType} from '../core/base-component';
import {LineId, lineIdType} from '../id/line-id';
import {TriggerEvent} from '../trigger/trigger-event';
import {TriggerSpec, TRIGGER_SPEC_TYPE} from '../types/trigger-spec';

import {LineState, PadContentType, PadState} from './pad-state';

interface LineConfig extends TriggerSpec {
  readonly lineId: LineId<unknown>;
  readonly lineName: string;
}

export const LINE_CONFIG_TYPE: Type<LineConfig> = intersectType([
  TRIGGER_SPEC_TYPE,
  hasPropertiesType({
    lineId: lineIdType(unknownType),
    lineName: stringType,
  }),
]);

export interface LineActionInput {
  readonly x: number;
  readonly y: number;
}

export const LINE_ACTION_INPUT_TYPE = hasPropertiesType({
  x: numberType,
  y: numberType,
});

type LineAction = (context: Context<BaseComponentSpecType<PadState>>) => OperatorFunction<TriggerEvent|[LineActionInput], TriggerEvent|[LineActionInput]>;

export function lineActionFactory(config: LineConfig): LineAction {
  return $ => {
    const contents$ = flattenResolver($.host.state).$('contents');
    const halfLine$ = flattenResolver($.host.state).$('halfLine');
    return pipe(
        withLatestFrom(contents$, halfLine$),
        switchMap(([input, contents, halfLine]) => {
          const {x, y} = getLineLocation(input);
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
    x: triggerOrInput.details.mouseX,
    y: triggerOrInput.details.mouseY,
  };
}
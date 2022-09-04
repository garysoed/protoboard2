import {flattenResolver} from 'gs-tools/export/state';
import {arrayOfType, hasPropertiesType, numberType} from 'gs-types';
import {Context} from 'persona';
import {Observable, of, OperatorFunction, pipe} from 'rxjs';
import {mapTo, switchMap, withLatestFrom} from 'rxjs/operators';

import {BaseComponentSpecType} from '../../core/base-component';
import {TriggerEvent} from '../../trigger/trigger-event';

import {PadContentType, PadState, StampState} from './pad-state';


export interface StampActionInput {
  readonly x: number;
  readonly y: number;
}

export const STAMP_ACTION_INPUT_TYPE = hasPropertiesType({
  x: numberType,
  y: numberType,
});

interface Config {
  readonly stampId: string;
}

type StampAction = (context: Context<BaseComponentSpecType<PadState>>) => OperatorFunction<TriggerEvent|[StampActionInput], TriggerEvent|[StampActionInput]>;

export function stampActionFactory(config: Config, target$: Observable<Element>): StampAction {
  return $ => {
    const stamps$ = flattenResolver($.host.state).$('contents');
    return pipe(
        withLatestFrom(stamps$, target$),
        switchMap(([input, stamps, target]) => {
          const rect = target.getBoundingClientRect();
          const {x: xRaw, y: yRaw} = createNewStampLocation(input);
          const stampState: StampState = {
            type: PadContentType.STAMP,
            stampId: config.stampId,
            x: xRaw - rect.left,
            y: yRaw - rect.top,
          };
          return of([...stamps, stampState]).pipe(
              stamps$.set(),
              mapTo(input),
          );
        }),
    );
  };
}

type StampLocation = Omit<StampState, 'stampId'|'type'>;

function createNewStampLocation(triggerOrInput: TriggerEvent|[StampActionInput]): StampLocation {
  if (arrayOfType(STAMP_ACTION_INPUT_TYPE).check(triggerOrInput)) {
    return triggerOrInput[0];
  }

  return {
    x: triggerOrInput.details.mouseClientX,
    y: triggerOrInput.details.mouseClientY,
  };
}
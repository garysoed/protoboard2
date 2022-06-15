import {flattenResolver} from 'gs-tools/export/state';
import {arrayOfType, hasPropertiesType, intersectType, numberType, stringType, Type, unknownType} from 'gs-types';
import {Context} from 'persona';
import {of, OperatorFunction, pipe} from 'rxjs';
import {mapTo, switchMap, withLatestFrom} from 'rxjs/operators';

import {BaseComponentSpecType} from '../core/base-component';
import {StampId, stampIdType} from '../id/stamp-id';
import {TriggerEvent} from '../trigger/trigger-event';
import {TriggerSpec, TRIGGER_SPEC_TYPE} from '../types/trigger-spec';

import {PadContentType, PadState, StampState} from './pad-state';

interface StampConfig extends TriggerSpec {
  readonly stampId: StampId<unknown>;
  readonly stampName: string;
}

export const STAMP_CONFIG_TYPE: Type<StampConfig> = intersectType([
  TRIGGER_SPEC_TYPE,
  hasPropertiesType({
    stampId: stampIdType(unknownType),
    stampName: stringType,
  }),
]);

export interface StampActionInput {
  readonly x: number;
  readonly y: number;
}

export const STAMP_ACTION_INPUT_TYPE = hasPropertiesType({
  x: numberType,
  y: numberType,
});

type StampAction = (context: Context<BaseComponentSpecType<PadState>>) => OperatorFunction<TriggerEvent|[StampActionInput], TriggerEvent|[StampActionInput]>;

export function stampActionFactory(config: StampConfig): StampAction {
  return $ => {
    const stamps$ = flattenResolver($.host.state).$('contents');
    return pipe(
        withLatestFrom(stamps$),
        switchMap(([input, stamps]) => {
          const stampState = {
            type: PadContentType.STAMP,
            stampId: config.stampId,
            ...createNewStampLocation(input),
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
    x: triggerOrInput.details.mouseX,
    y: triggerOrInput.details.mouseY,
  };
}
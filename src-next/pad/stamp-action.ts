import {flattenResolver} from 'gs-tools/export/state';
import {arrayOfType, hasPropertiesType, numberType, stringType, Type, unknownType} from 'gs-types';
import {Context} from 'persona';
import {of, OperatorFunction, pipe} from 'rxjs';
import {mapTo, switchMap, withLatestFrom} from 'rxjs/operators';

import {BaseComponentSpecType} from '../core/base-component';
import {StampId, stampIdType} from '../id/stamp-id';
import {TriggerEvent} from '../trigger/trigger-event';
import {TriggerSpec, TRIGGER_SPEC_TYPE} from '../types/trigger-spec';

import {PadState, StampState} from './pad-state';

interface StampConfig {
  readonly stampId: StampId<unknown>;
  readonly stampName: string;
  readonly trigger: TriggerSpec;
}

export const STAMP_CONFIG_TYPE: Type<StampConfig> = hasPropertiesType({
  stampId: stampIdType(unknownType),
  stampName: stringType,
  trigger: TRIGGER_SPEC_TYPE,
});

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
    const stamps$ = flattenResolver($.host.state).$('stamps');
    return pipe(
        withLatestFrom(stamps$),
        switchMap(([input, stamps]) => {
          const stampState = {
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

type StampLocation = Omit<StampState, 'stampId'>;

function createNewStampLocation(triggerOrInput: TriggerEvent|[StampActionInput]): StampLocation {
  if (arrayOfType(STAMP_ACTION_INPUT_TYPE).check(triggerOrInput)) {
    return triggerOrInput[0];
  }

  return {
    x: triggerOrInput.details.mouseX,
    y: triggerOrInput.details.mouseY,
  };
}
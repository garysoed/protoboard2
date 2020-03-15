import { Converter, Result } from 'nabu';
import { enumParser } from 'persona';

import { TriggerKey, TriggerSpec, TriggerType } from './trigger-spec';

const TRIGGER_KEY_PARSER = enumParser<TriggerKey>(TriggerKey);

export class TriggerParser implements Converter<TriggerSpec, string> {
  convertBackward(value: string): Result<TriggerSpec> {
    if (value === 'click') {
      return {success: true, result: {type: TriggerType.CLICK}};
    }

    const triggerKeyResult = TRIGGER_KEY_PARSER.convertBackward(value);
    if (triggerKeyResult.success) {
      return {success: true, result: {type: TriggerType.KEY, key: triggerKeyResult.result}};
    }

    return {success: false};
  }

  convertForward(input: TriggerSpec): Result<string> {
    switch (input.type) {
      case TriggerType.CLICK:
        return {success: true, result: 'click'};
      case TriggerType.KEY:
        return {success: true, result: input.key};
    }
  }
}

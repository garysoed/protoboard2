import {$asArray, $filterNonNull, $last, $map, $pipe, $scan} from 'gs-tools/export/collect';
import {enumType} from 'gs-types';
import {Converter, Result} from 'nabu';
import {Selector} from 'persona';

export enum TriggerType {
  A = 'a',
  B = 'b',
  C = 'c',
  D = 'd',
  E = 'e',
  F = 'f',
  G = 'g',
  H = 'h',
  I = 'i',
  J = 'j',
  K = 'k',
  L = 'l',
  M = 'm',
  N = 'n',
  O = 'o',
  P = 'p',
  Q = 'q',
  R = 'r',
  S = 's',
  T = 't',
  U = 'u',
  V = 'v',
  W = 'w',
  X = 'x',
  Y = 'y',
  Z = 'z',
  NUM_0 = '0',
  NUM_1 = '1',
  NUM_2 = '2',
  NUM_3 = '3',
  NUM_4 = '4',
  NUM_5 = '5',
  NUM_6 = '6',
  NUM_7 = '7',
  NUM_8 = '8',
  NUM_9 = '9',
  QUESTION = '?',
  CLICK = 'click',
}

export const TRIGGER_TYPE_TYPE = enumType<TriggerType>(TriggerType);

export interface TriggerSpec {
  readonly type: TriggerType;
  readonly targetEl?: Selector<Element, {}>;
  readonly alt?: boolean;
  readonly ctrl?: boolean;
  readonly meta?: boolean;
  readonly shift?: boolean;
}

export function isKeyTrigger(triggerType: TriggerType): boolean {
  return triggerType !== TriggerType.CLICK;
}

class BooleanFlagParser implements Converter<boolean|undefined, string> {
  private readonly trueStr = this.key;
  private readonly falseStr = `no${this.key}`;

  constructor(private readonly key: string) { }

  convertBackward(value: string): Result<boolean|undefined> {
    if (!value) {
      return {success: true, result: undefined};
    }

    switch (value) {
      case this.trueStr:
        return {success: true, result: true};
      case this.falseStr:
        return {success: true, result: false};
      default:
        return {success: false};
    }
  }

  convertForward(input: boolean|undefined): Result<string> {
    if (input === undefined) {
      return {success: true, result: ''};
    }

    const result = input ? this.trueStr : this.falseStr;
    return {success: true, result};
  }
}

class TriggerSpecParser implements Converter<TriggerSpec, string> {
  private readonly altParser = new BooleanFlagParser('alt');
  private readonly ctrlParser = new BooleanFlagParser('ctrl');
  private readonly metaParser = new BooleanFlagParser('meta');
  private readonly shiftParser = new BooleanFlagParser('shift');

  convertBackward(value: string): Result<TriggerSpec> {
    const [typePart, options] = value.split(':');
    if (!TRIGGER_TYPE_TYPE.check(typePart)) {
      return {success: false};
    }

    if (!options) {
      return {success: true, result: {type: typePart}};
    }

    const triggerOptions = $pipe(
        options.split('|'),
        $map(optionPart => {
          const altResult = this.altParser.convertBackward(optionPart);
          if (altResult.success && altResult.result !== undefined) {
            return {alt: altResult.result};
          }

          const ctrlResult = this.ctrlParser.convertBackward(optionPart);
          if (ctrlResult.success && ctrlResult.result !== undefined) {
            return {ctrl: ctrlResult.result};
          }

          const metaResult = this.metaParser.convertBackward(optionPart);
          if (metaResult.success && metaResult.result !== undefined) {
            return {meta: metaResult.result};
          }

          const shiftResult = this.shiftParser.convertBackward(optionPart);
          if (shiftResult.success && shiftResult.result !== undefined) {
            return {shift: shiftResult.result};
          }

          return null;
        }),
        $filterNonNull(),
        $scan((item, acc) => ({...acc, ...item}), {}),
        $asArray(),
        $last(),
    );

    if (!triggerOptions) {
      return {success: true, result: {type: typePart}};
    }

    return {success: true, result: {...triggerOptions, type: typePart}};
  }

  convertForward(input: TriggerSpec): Result<string> {
    if (typeof input === 'string') {
      return {success: true, result: input};
    }

    const options = $pipe(
        [
          this.altParser.convertForward(input.alt),
          this.ctrlParser.convertForward(input.ctrl),
          this.metaParser.convertForward(input.meta),
          this.shiftParser.convertForward(input.shift),
        ],
        $map(result => (result.success ? result.result : null) || null),
        $filterNonNull(),
        $asArray(),
    ).join('|');

    if (!options) {
      return {success: true, result: input.type};
    }

    return {success: true, result: `${input.type}:${options}`};
  }
}

export function triggerSpecParser(): Converter<TriggerSpec, string> {
  return new TriggerSpecParser();
}
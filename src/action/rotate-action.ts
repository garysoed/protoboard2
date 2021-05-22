import {$stateService} from 'grapevine';
import {$asArray, $map, $pipe, $sort, $zip, countableIterable, normal, withMap} from 'gs-tools/export/collect';
import {attributeIn, integerParser, listParser} from 'persona';
import {EMPTY, OperatorFunction, pipe} from 'rxjs';
import {map, share, switchMap, take, tap, withLatestFrom} from 'rxjs/operators';

import {TriggerEvent} from '../core/trigger-event';
import {triggerSpecParser, TriggerType} from '../core/trigger-spec';
import {IsRotatable} from '../payload/is-rotatable';
import {PieceSpec} from '../types/piece-spec';

import {ActionContext, getObject$} from './action-context';
import {ActionSpec, ConfigSpecs, TriggerConfig} from './action-spec';


export interface Config extends TriggerConfig {
  readonly stops: readonly number[];
}

function action(context: ActionContext<PieceSpec<IsRotatable>, Config>): OperatorFunction<TriggerEvent, unknown> {
  const stateService = $stateService.get(context.vine);
  const stops$ = context.config$.pipe(map(config => config.stops));
  return pipe(
      withLatestFrom(getObject$(context), stops$),
      switchMap(([, obj, stops]) => {
        if (!obj) {
          return EMPTY;
        }

        const $rotationDeg = obj.payload.$rotationDeg;
        return stateService.resolve($rotationDeg).pipe(
            take(1),
            map(rotationDeg => rotationDeg ?? 0),
            tap(rotationDeg => {
              const rotationIndex = $pipe(
                  stops,
                  $zip(countableIterable()),
                  $map(([stop, index]) => {
                    const distance = Math.abs((stop % 360) - (rotationDeg % 360));
                    return [distance, index] as [number, number];
                  }),
                  $asArray(),
                  $sort(withMap(([value]) => value, normal())),
              )[0][1];

              const newIndex = (rotationIndex + 1) % stops.length;
              stateService.modify(x => x.set($rotationDeg, stops[newIndex]));
            }),
            share(),
        );
      }),
  );
}

const DEFAULT_CONFIG: Config = {
  stops: [0, 90, 180, 270],
  trigger: TriggerType.R,
};

export function rotateAction(
    defaultOverride: Partial<Config> = {},
    configSpecsOverride: Partial<ConfigSpecs<Config>> = {},
): ActionSpec<Config> {
  const defaultConfig = {...DEFAULT_CONFIG, ...defaultOverride};
  return {
    action,
    actionName: 'Rotate',
    configSpecs: {
      stops: attributeIn('pb-rotate-stops', listParser(integerParser()), defaultConfig.stops),
      trigger: attributeIn('pb-rotate-trigger', triggerSpecParser(), defaultConfig.trigger),
      ...configSpecsOverride,
    },
  };
}
import {$asArray, $map, $pipe, $sort, $zip, countableIterable, normal, withMap} from 'gs-tools/export/collect';
import {flattenResolver} from 'gs-tools/export/state';
import {arrayOfType, hasPropertiesType, numberType} from 'gs-types';
import {Context} from 'persona';
import {Observable, OperatorFunction, pipe} from 'rxjs';
import {map, withLatestFrom} from 'rxjs/operators';

import {BaseComponentSpecType} from '../core/base-component';
import {IsRotatable} from '../types/is-rotatable';


export interface RotateConfig {
  readonly stops: readonly number[];
}

export const DEFAULT_ROTATE_CONFIG: RotateConfig = {
  stops: [0, 90, 180, 270],
};

export const ROTATE_CONFIG_TYPE = hasPropertiesType({
  stops: arrayOfType(numberType),
});

export function rotateAction(
    $: Context<BaseComponentSpecType<IsRotatable>>,
    config$: Observable<RotateConfig>,
): OperatorFunction<unknown, unknown> {
  const currentRotation$ = flattenResolver($.host.state).$('rotationDeg');
  return pipe(
      withLatestFrom(config$, currentRotation$),
      map(([, config, rotationDeg]) => {
        const stops = config.stops;
        const rotationIndex = $pipe(
            stops,
            $zip(countableIterable()),
            $map(([stop, index]) => {
              const distance = Math.abs((stop % 360) - ((rotationDeg ?? 0) % 360));
              return [distance, index] as [number, number];
            }),
            $asArray(),
            $sort(withMap(([value]) => value, normal())),
        )[0][1];

        const newIndex = (rotationIndex + 1) % stops.length;
        return stops[newIndex];
      }),
      currentRotation$.set(),
  );
}

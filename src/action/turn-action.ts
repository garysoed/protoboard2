import {filterNonNullable, walkObservable} from 'gs-tools/export/rxjs';
import {hasPropertiesType, numberType} from 'gs-types';
import {Context} from 'persona';
import {Observable, OperatorFunction, pipe} from 'rxjs';
import {map, withLatestFrom} from 'rxjs/operators';

import {BaseComponentSpecType} from '../core/base-component';
import {IsMultifaced} from '../types/is-multifaced';


export interface TurnConfig {
  readonly step: number;
}

export const DEFAULT_TURN_CONFIG: TurnConfig = {
  step: 1,
};

export const TURN_CONFIG_TYPE = hasPropertiesType({
  step: numberType,
});

export const KEY = 'turn';

export function turnAction(
    $: Context<BaseComponentSpecType<IsMultifaced>>,
    config$: Observable<TurnConfig>,
): OperatorFunction<unknown, unknown> {
  const state$ = walkObservable($.host.state.pipe(filterNonNullable()));
  const currentFaceIndex$ = state$.$('currentFaceIndex');
  const faces$ = state$._('faces');
  return pipe(
      withLatestFrom(config$, currentFaceIndex$, faces$),
      map(([, config, faceIndex, faces]) => {
        return ((faceIndex ?? 0) + config.step) % faces.length;
      }),
      currentFaceIndex$.set(),
  );
}

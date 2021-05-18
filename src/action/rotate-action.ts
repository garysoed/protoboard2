import {$stateService} from 'grapevine';
import {$asArray, $map, $pipe, $sort, $zip, countableIterable, normal, withMap} from 'gs-tools/export/collect';
import {attributeIn, integerParser, listParser} from 'persona';
import {EMPTY, OperatorFunction, pipe} from 'rxjs';
import {map, share, switchMap, take, tap, withLatestFrom} from 'rxjs/operators';

import {ActionContext, BaseAction, TriggerEvent} from '../core/base-action';
import {UnreservedTriggerSpec} from '../core/trigger-spec';
import {IsRotatable} from '../payload/is-rotatable';
import {PieceSpec} from '../types/piece-spec';

import {ActionSpec, ConfigSpecs} from './action-spec';


export interface Config {
  readonly stops: readonly number[];
}

/**
 * Lets the user rotate the object on the same face.
 *
 * @thModule action
 */
class RotateAction extends BaseAction<PieceSpec<IsRotatable>, Config> {
  constructor() {
    super('Rotate');
  }

  getOperator(context: ActionContext<PieceSpec<IsRotatable>, Config>): OperatorFunction<TriggerEvent, unknown> {
    const stateService = $stateService.get(context.vine);
    const stops$ = context.config$.pipe(map(config => config.stops));
    return pipe(
        withLatestFrom(this.getObject$(context), stops$),
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
}

export function rotateAction(
    defaultConfig: Config,
    trigger: UnreservedTriggerSpec,
    configSpecsOverride: Partial<ConfigSpecs<Config>> = {},
): ActionSpec<Config> {
  return {
    defaultConfig,
    trigger,
    action: new RotateAction(),
    configSpecs: {
      stops: attributeIn('pb-rotate-stops', listParser(integerParser()), defaultConfig.stops),
      ...configSpecsOverride,
    },
  };
}
import {$stateService} from 'grapevine';
import {$asArray, $map, $pipe, $sort, $zip, countableIterable, normal, withMap} from 'gs-tools/export/collect';
import {cache} from 'gs-tools/export/data';
import {identity} from 'nabu';
import {listParser} from 'persona';
import {EMPTY, Observable, OperatorFunction, pipe} from 'rxjs';
import {map, share, switchMap, take, tap, withLatestFrom} from 'rxjs/operators';

import {ActionContext, BaseAction, TriggerEvent} from '../core/base-action';
import {IsRotatable} from '../payload/is-rotatable';
import {PieceSpec} from '../types/piece-spec';


export interface Config {
  readonly stops: readonly number[];
}

/**
 * Lets the user rotate the object on the same face.
 *
 * @thModule action
 */
export class RotateAction extends BaseAction<PieceSpec<IsRotatable>, Config> {
  constructor(
      context: ActionContext<PieceSpec<IsRotatable>, Config>,
      defaultConfig: Config,
  ) {
    super(
        'rotate',
        'Rotate',
        {stops: listParser(identity<number>())},
        context,
        defaultConfig,
    );
  }

  @cache()
  private get stops$(): Observable<readonly number[]> {
    return this.config$.pipe(map(config => config.stops));
  }

  @cache()
  get operator(): OperatorFunction<TriggerEvent, unknown> {
    const stateService = $stateService.get(this.vine);
    return pipe(
        withLatestFrom(this.objectSpec$),
        switchMap(([, objectSpec]) => {
          if (!objectSpec) {
            return EMPTY;
          }

          const $rotationDeg = objectSpec.payload.$rotationDeg;
          return stateService.resolve($rotationDeg).pipe(
              take(1),
              map(rotationDeg => rotationDeg ?? 0),
              withLatestFrom(this.stops$),
              tap(([rotationDeg, stops]) => {
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

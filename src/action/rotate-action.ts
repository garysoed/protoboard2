import {$asArray, $map, $pipe, $sort, $zip, countableIterable, normal, withMap} from 'gs-tools/export/collect';
import {cache} from 'gs-tools/export/data';
import {$stateService} from 'mask';
import {identity} from 'nabu';
import {listParser} from 'persona';
import {EMPTY, Observable} from 'rxjs';
import {map, share, switchMap, take, tap, withLatestFrom} from 'rxjs/operators';
import {Logger} from 'santa';

import {ActionContext, BaseAction} from '../core/base-action';
import {IsRotatable} from '../payload/is-rotatable';
import {PieceSpec} from '../types/piece-spec';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGER = new Logger('pb.RotateAction');


interface Config {
  readonly stops: readonly number[];
}

/**
 * Lets the user rotate the object on the same face.
 *
 * @thModule action
 */
export class RotateAction extends BaseAction<PieceSpec<IsRotatable>, Config> {
  constructor(
      context: ActionContext<PieceSpec<IsRotatable>>,
      defaultConfig: Config,
  ) {
    super(
        'rotate',
        'Rotate',
        {stops: listParser(identity<number>())},
        context,
        defaultConfig,
    );

    this.addSetup(this.handleTrigger$);
  }

  private get handleTrigger$(): Observable<unknown> {
    return this.onTrigger$.pipe(
        withLatestFrom(
            this.objectSpec$,
            $stateService.get(this.vine),
        ),
        switchMap(([, objectSpec, stateService]) => {
          if (!objectSpec) {
            return EMPTY;
          }

          const $rotationDeg = objectSpec.payload.$rotationDeg;
          return stateService.get($rotationDeg).pipe(
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
                stateService.set($rotationDeg, stops[newIndex]);
              }),
              share(),
          );
        }),
    );
  }

  @cache()
  private get stops$(): Observable<readonly number[]> {
    return this.config$.pipe(map(config => config.stops));
  }
}

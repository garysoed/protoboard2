import { cache } from 'gs-tools/export/data';
import { identity } from 'nabu';
import { host, integerParser, listParser } from 'persona';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, mapTo, scan, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { ActionContext, BaseAction } from '../core/base-action';

import { RotatablePayload } from './payload/rotatable-payload';


interface Config {
  readonly index: number;
  readonly stops: readonly number[];
}

export class RotateAction extends BaseAction<RotatablePayload, Config> {
  constructor(
      context: ActionContext<RotatablePayload>,
      private readonly defaultConfig: Config,
  ) {
    super(
        'rotate',
        'Rotate',
        {
          index: integerParser(),
          stops: listParser(identity<number>()),
        },
        context,
    );

    this.addSetup(this.handleTrigger$);
  }

  private get handleTrigger$(): Observable<unknown> {
    const host$ = host({}).getValue(this.context.personaContext).pipe(
        filter((el): el is HTMLElement => el instanceof HTMLElement),
    );

    return combineLatest([this.index$, this.stops$])
        .pipe(
            withLatestFrom(host$),
            tap(([[index, stops], hostEl]) => {
              hostEl.style.transform = `rotateZ(${stops[index]}deg)`;
            }),
        );
  }

  @cache()
  private get index$(): Observable<number> {
    return this.config$.pipe(
        switchMap(config => {
          const startIndex = config.index ?? this.defaultConfig.index;
          const stops = config.stops ?? this.defaultConfig.stops;
          return this.onTrigger$.pipe(
              mapTo(1),
              scan(
                  (acc, value) => {
                    return (acc + value) % (stops.length || 1);
                  },
                  startIndex,
              ),
              startWith(startIndex),
          );
        }),
    );
  }

  @cache()
  private get stops$(): Observable<readonly number[]> {
    return this.config$.pipe(
        map(config => config.stops ?? this.defaultConfig.stops),
    );
  }
}

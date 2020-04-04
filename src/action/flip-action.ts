import { Vine } from 'grapevine';
import { cache } from 'gs-tools/export/data';
import { element, integerParser } from 'persona';
import { combineLatest, concat, Observable } from 'rxjs';
import { map, switchMap, take, takeUntil, withLatestFrom } from 'rxjs/operators';

import { BaseAction } from '../core/base-action';

import { $face } from './face';


const $ = {
  host: element($face),
};

interface Config {
  readonly count: number;
  readonly index: number;
}

export const KEY = 'flip';

export class FlipAction extends BaseAction<Config> {
  constructor(
      private readonly count: number,
      private readonly index: number,
      vine: Vine,
  ) {
    super(
        KEY,
        'Flip',
        {
          count: integerParser(),
          index: integerParser(),
        },
        vine,
    );

    this.setup();
  }

  private setup(): void {
    const indexAttr$ = this.actionTarget$.pipe(
        switchMap(shadowRoot => $.host._.currentFaceIn.getValue(shadowRoot)),
    );

    const currentIndex$ = combineLatest([indexAttr$, this.defaultIndex$])
        .pipe(
            map(([indexAttr, defaultIndex]) => indexAttr ?? defaultIndex),
        );

    const newIndex$ = this.onTrigger$.pipe(
        withLatestFrom(currentIndex$),
        map(([, currentIndex]) => currentIndex + 1),
    );

    const index$ = concat(currentIndex$.pipe(take(1)), newIndex$).pipe(
        withLatestFrom(this.count$),
        map(([value, count]) => value % count),
    );

    this.actionTarget$
        .pipe(
            switchMap(shadowRoot => {
              return index$.pipe($.host._.currentFaceOut.output(shadowRoot));
            }),
            takeUntil(this.onDispose$),
        )
        .subscribe();
  }

  @cache()
  private get count$(): Observable<number> {
    return this.config$.pipe(
        map(config => config.count ?? this.count),
    );
  }

  @cache()
  private get defaultIndex$(): Observable<number> {
    return this.config$.pipe(
        map(config => config.index ?? this.index),
    );
  }
}

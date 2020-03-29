import { Vine } from 'grapevine';
import { cache } from 'gs-tools/export/data';
import { filterNonNull } from 'gs-tools/export/rxjs';
import { attributeOut, element, integerParser } from 'persona';
import { combineLatest, merge, Observable, Subject } from 'rxjs';
import { map, startWith, switchMap, takeUntil, withLatestFrom } from 'rxjs/operators';

import { BaseAction } from '../core/base-action';


export const $$ = {
  currentFace: attributeOut('current-face', integerParser()),
};

const $ = {
  host: element($$),
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

    this.setupOnSetIndex$();
    this.setupUpdateHost();
  }

  @cache()
  private get count$(): Observable<number> {
    return this.config$.pipe(
        map(config => config.count || null),
        filterNonNull(),
        startWith(this.count),
    );
  }

  @cache()
  private get index$(): Observable<number> {
    return combineLatest([this.onSetIndex$, this.count$])
        .pipe(
            map(([newIndex, count]) => newIndex % count),
            startWith(this.index),
        );
  }

  @cache()
  private get onSetIndex$(): Subject<number> {
    return new Subject<number>();
  }

  private setupOnSetIndex$(): void {
    const onTrigger$ = this.onTrigger$.pipe(
        withLatestFrom(this.index$),
        map(([, index]) => index + 1),
    );

    const onConfig$ = this.config$.pipe(
        map(config => config.index || null),
        filterNonNull(),
    );

    merge(onConfig$, onTrigger$)
        .pipe(takeUntil(this.onDispose$))
        .subscribe(value => {
          this.onSetIndex$.next(value);
        });
  }

  private setupUpdateHost(): void {
    const currentFace$ = combineLatest([
      this.index$,
      this.count$,
    ])
    .pipe(map(([index, count]) => index % count));

    this.actionTarget$
        .pipe(
            switchMap(shadowRoot => $.host._.currentFace.output(shadowRoot, currentFace$)),
            takeUntil(this.onDispose$),
        )
        .subscribe();
  }
}

import { Vine } from 'grapevine';
import { cache } from 'gs-tools/export/data';
import { filterNonNull } from 'gs-tools/export/rxjs';
import { identity } from 'nabu';
import { element, integerParser, listParser } from 'persona';
import { combineLatest, merge, Observable, Subject } from 'rxjs';
import { filter, map, startWith, switchMap, takeUntil, withLatestFrom } from 'rxjs/operators';

import { BaseAction } from '../core/base-action';


interface Config {
  readonly index: number;
  readonly stops: readonly number[];
}

export class RotateAction extends BaseAction<Config> {

  @cache()
  private get index$(): Observable<number> {
    return this.newIndex$
        .pipe(
            withLatestFrom(this.stops$),
            map(([newIndex, stops]) => newIndex % stops.length),
            startWith(this.index),
        );
  }
  private readonly newIndex$ = new Subject<number>();

  @cache()
  private get stops$(): Observable<readonly number[]> {
    return this.config$.pipe(
        map(config => config.stops || null),
        filterNonNull(),
        startWith(this.stops),
    );
  }

  constructor(
      private readonly index: number,
      private readonly stops: readonly number[],
      vine: Vine,
  ) {
    super(
        'rotate',
        'Rotate',
        {
          index: integerParser(),
          stops: listParser(identity<number>()),
        },
        vine,
    );

    this.setupHandleRotation();
    this.setupNewIndex$();
  }

  private setupHandleRotation(): void {
    const host$ = this.actionTarget$.pipe(
        switchMap(shadowRoot => {
          return element({}).getValue(shadowRoot);
        }),
        filter((el): el is HTMLElement => el instanceof HTMLElement),
    );
    combineLatest([this.index$, this.stops$])
        .pipe(
            withLatestFrom(host$),
            takeUntil(this.onDispose$),
        )
        .subscribe(([[index, stops], hostEl]) => {
          hostEl.style.transform = `rotateZ(${stops[index]}deg)`;
        });
  }

  private setupNewIndex$(): void {
    const onConfig$: Observable<number> = this.config$.pipe(
        map(config => config.index || null),
        filterNonNull(),
    );

    const onTrigger$: Observable<number> = this.onTrigger$
        .pipe(
            withLatestFrom(this.index$),
            map(([, index]) => index + 1),
        );

    merge(onConfig$, onTrigger$)
        .pipe(takeUntil(this.onDispose$))
        .subscribe(value => {
          this.newIndex$.next(value);
        });
  }
}

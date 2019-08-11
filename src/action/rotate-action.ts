import { integerParser, listParser } from '@mask';
import { identity } from '@nabu';
import { element, InitFn } from '@persona';
import { BehaviorSubject, combineLatest, Observable, Subject } from '@rxjs';
import { filter, tap, withLatestFrom } from '@rxjs/operators';

import { BaseAction } from '../core/base-action';
import { TriggerKey, TriggerType } from '../core/trigger-spec';


interface Config {
  index: number;
  stops: number[];
}

export class RotateAction extends BaseAction<Config> {
  private readonly index$ = new BehaviorSubject<number>(this.index);
  private readonly newIndex$ = new Subject<number>();
  private readonly stops$ = new BehaviorSubject(this.stops);

  constructor(
      private readonly index: number,
      private readonly stops: number[],
  ) {
    super(
        'rotate',
        'Rotate',
        {
          index: integerParser(),
          stops: listParser(identity<number>()),
        },
        {type: TriggerType.KEY, key: TriggerKey.R},
    );
  }

  install(): InitFn {
    const superInstall = super.install();

    return (vine, root) => {
      return combineLatest([
        superInstall(vine, root),
        this.setupHandleNewIndex(),
        this.setupHandleRotation(root),
      ]);
    };
  }

  protected onConfig(config$: Observable<Partial<Config>>): Observable<unknown> {
    return config$.pipe(
        tap(config => {
          if (config.index !== undefined) {
            this.newIndex$.next(config.index);
          }

          if (config.stops) {
            this.stops$.next(config.stops);
          }
        }),
    );
  }

  protected onTrigger(trigger$: Observable<{}>): Observable<unknown> {
    return trigger$.pipe(
        withLatestFrom(this.index$),
        tap(([, index]) => {
          this.newIndex$.next(index + 1);
        }),
    );
  }

  private setupHandleNewIndex(): Observable<unknown> {
    return this.newIndex$.pipe(
        withLatestFrom(this.stops$),
        tap(([newIndex, stops]) => {
          this.index$.next(newIndex % stops.length);
        }),
    );
  }

  private setupHandleRotation(root: ShadowRoot): Observable<unknown> {
    return combineLatest([
          this.index$,
          this.stops$,
        ])
        .pipe(
            withLatestFrom(
                element({}).getValue(root).pipe(
                    filter((el): el is HTMLElement => el instanceof HTMLElement),
                ),
            ),
            tap(([[index, stops], hostEl]) => {
              hostEl.style.transform = `rotateZ(${stops[index]}deg)`;
            }),
        );
  }
}

import { Vine } from 'grapevine';
import { attributeOut, element, integerParser } from 'persona';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { map, tap, withLatestFrom } from 'rxjs/operators';

import { BaseAction } from '../core/base-action';
import { TriggerKey, TriggerType } from '../core/trigger-spec';


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

export class FlipAction extends BaseAction<Config> {
  private readonly count$: BehaviorSubject<number>;
  private readonly index$: BehaviorSubject<number>;
  private readonly onSetIndex$ = new Subject<number>();

  constructor(
      count: number,
      index: number,
  ) {
    super(
        'flip',
        'Flip',
        {
          count: integerParser(),
          index: integerParser(),
        },
        {type: TriggerType.KEY, key: TriggerKey.F},
    );

    this.count$ = new BehaviorSubject(count);
    this.index$ = new BehaviorSubject(index);
  }

  protected getSetupObs(shadowRoot: ShadowRoot, vine: Vine): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.getSetupObs(shadowRoot, vine),
      this.setupOnSetIndex(),
      this.setupUpdateHost(shadowRoot),
    ];
  }

  protected onConfig(config$: Observable<Partial<Config>>): Observable<unknown> {
    return config$.pipe(
        tap(config => {
          if (config.count !== undefined) {
            this.count$.next(config.count);
          }

          if (config.index !== undefined) {
            this.onSetIndex$.next(config.index);
          }
        }),
    );
  }

  protected setupHandleTrigger(trigger$: Observable<unknown>): Observable<unknown> {
    return trigger$.pipe(
        withLatestFrom(this.index$),
        tap(([, index]) => this.onSetIndex$.next(index + 1)),
    );
  }

  protected setupOnSetIndex(): Observable<unknown> {
    return this.onSetIndex$.pipe(
        withLatestFrom(this.count$),
        tap(([newIndex, count]) => this.index$.next(newIndex % count)),
    );
  }

  protected setupUpdateHost(root: ShadowRoot): Observable<unknown> {
    const currentFace$ = combineLatest([
      this.index$,
      this.count$,
    ])
    .pipe(map(([index, count]) => index % count));

    return $.host._.currentFace.output(root, currentFace$);
  }
}

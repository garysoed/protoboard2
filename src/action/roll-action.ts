import { Vine } from 'grapevine';
import { cache } from 'gs-tools/export/data';
import { element, integerParser } from 'persona';
import { Observable, Subject } from 'rxjs';
import { map, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { BaseAction } from '../core/base-action';
import { $random } from '../util/random';

import { $face } from './face';


const $ = {
  host: element($face),
};

interface Config {
  readonly count: number;
}

export class RollAction extends BaseAction<Config> {
  private readonly onIndexSwitch$ = new Subject<number>();

  constructor(
      private readonly config: Config,
      vine: Vine,
  ) {
    super(
        'roll',
        'Roll',
        {count: integerParser()},
        vine,
    );

    this.setup();
  }

  private setup(): void {
    const newValue$ = this.onTrigger$
        .pipe(
            withLatestFrom(this.count$, $random.get(this.vine)),
            map(([, count, random]) => {
              return random.next(({random, rng}) => {
                return rng.map(() => Math.floor(random * count));
              });
            }),
            tap(nextRandom => {
              $random.get(this.vine).next(nextRandom);
            }),
            map(({value}) => value),
        );


    this.actionTarget$
        .pipe(
            switchMap(shadowRoot => {
              return newValue$.pipe($.host._.currentFaceOut.output(shadowRoot));
            }),
            takeUntil(this.onDispose$),
        )
        .subscribe();
  }

  @cache()
  private get count$(): Observable<number> {
    return this.config$.pipe(
        map(config => config.count ?? this.config.count),
    );
  }
}

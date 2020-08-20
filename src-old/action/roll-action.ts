import { Vine } from 'grapevine';
import { cache } from 'gs-tools/export/data';
import { element, host, integerParser } from 'persona';
import { Observable } from 'rxjs';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { BaseAction } from '../core/base-action';
import { $random } from '../util/random';

import { $face } from './face';


const $ = {
  host: host($face),
};

interface Config {
  readonly count: number;
}

export class RollAction extends BaseAction<Config> {
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

    this.addSetup(this.setup());
  }

  private setup(): Observable<unknown> {
    const newValue$ = this.onTrigger$
        .pipe(
            withLatestFrom(this.count$, $random.get(this.vine)),
            map(([, count, random]) => {
              return random.next(({random, rng}) => {
                return rng.map(() => Math.floor(random * count));
              });
            }),
            tap(nextRandom => {
              $random.set(this.vine, () => nextRandom);
            }),
            map(({value}) => value),
        );


    return this.actionContext$
        .pipe(
            switchMap(shadowRoot => {
              return newValue$.pipe($.host._.currentFaceOut.output(shadowRoot));
            }),
        );
  }

  @cache()
  private get count$(): Observable<number> {
    return this.config$.pipe(
        map(config => config.count ?? this.config.count),
    );
  }
}

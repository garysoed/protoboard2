import { cache } from 'gs-tools/export/data';
import { filterNonNull } from 'gs-tools/export/rxjs';
import { attributeOut, element, integerParser, PersonaContext } from 'persona';
import { Observable, Subject } from 'rxjs';
import { map, startWith, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { BaseAction } from '../core/base-action';
import { TriggerKey, TriggerType } from '../core/trigger-spec';
import { $random } from '../util/random';


export const $$ = {
  currentFace: attributeOut('current-face', integerParser()),
};

const $ = {
  host: element($$),
};

interface Config {
  readonly count: number;
}

export class RollAction extends BaseAction<Config> {
  private readonly onIndexSwitch$ = new Subject<number>();

  constructor(
      private readonly config: Config,
      context: PersonaContext,
  ) {
    super(
        'roll',
        'Roll',
        {count: integerParser()},
        {type: TriggerType.KEY, key: TriggerKey.L},
        context,
    );

    this.setupOnIndexSwitch();
    this.setupHandleTrigger();
  }

  @cache()
  private get count$(): Observable<number> {
    return this.config$.pipe(
        map(config => config.count || null),
        filterNonNull(),
        startWith(this.config.count),
    );
  }

  protected setupOnIndexSwitch(): void {
    $.host._.currentFace.output(this.shadowRoot, this.onIndexSwitch$)
        .pipe(takeUntil(this.onDispose$))
        .subscribe();
  }

  private setupHandleTrigger(): void {
    this.onTrigger$
        .pipe(
            withLatestFrom(this.count$, $random.get(this.vine)),
            takeUntil(this.onDispose$),
        )
        .subscribe(([, count, random]) => {
          const nextRand = random.next(({random, rng}) => {
            this.onIndexSwitch$.next(Math.floor(random * count));
            return rng;
          });

          $random.get(this.vine).next(nextRand);
        });
  }
}

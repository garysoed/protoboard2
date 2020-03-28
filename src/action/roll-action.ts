import { aleaSeed, fromSeed, Random, RandomSeed } from 'gs-tools/export/random';
import { attributeOut, element, integerParser, PersonaContext } from 'persona';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { tap, withLatestFrom } from 'rxjs/operators';

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
}

export class RollAction extends BaseAction<Config> {
  private readonly count$ = new BehaviorSubject(this.config.count);
  private readonly onIndexSwitch$ = new Subject<number>();
  private readonly random$ = new BehaviorSubject<Random<unknown>>(fromSeed(this.seed));

  constructor(
      private readonly config: Config,
      private readonly seed: RandomSeed = aleaSeed(Math.random()),
  ) {
    super('roll', 'Roll', {count: integerParser()}, {type: TriggerType.KEY, key: TriggerKey.L});
  }

  protected getSetupObs(context: PersonaContext): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.getSetupObs(context),
      this.setupOnIndexSwitch(context.shadowRoot),
    ];
  }

  protected onConfig(config$: Observable<Partial<Config>>): Observable<unknown> {
    return config$.pipe(
        tap(config => {
          if (config.count !== undefined) {
            this.count$.next(config.count);
          }
        }),
    );
  }

  protected setupHandleTrigger(
      trigger$: Observable<unknown>,
  ): Observable<unknown> {
    return trigger$.pipe(
        withLatestFrom(this.count$, this.random$),
        tap(([, count, random]) => {
          const nextRand = random.next(({random, rng}) => {
            this.onIndexSwitch$.next(Math.floor(random * count));
            return rng;
          });

          this.random$.next(nextRand);
        }),
    );
  }

  protected setupOnIndexSwitch(root: ShadowRoot): Observable<unknown> {
    return $.host._.currentFace.output(root, this.onIndexSwitch$);
  }
}

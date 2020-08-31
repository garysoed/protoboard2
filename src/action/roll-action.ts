import { cache } from 'gs-tools/export/data';
import { integerParser } from 'persona';
import { Observable } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';

import { ActionContext, BaseAction } from '../core/base-action';

import { OrientablePayload } from './payload/orientable-payload';
import { $random } from './util/random';


interface Config {
  readonly count: number;
}

/**
 * Lets the user pick a random face of the object
 */
export class RollAction extends BaseAction<OrientablePayload, Config> {
  constructor(
      context: ActionContext<OrientablePayload>,
      private readonly defaultConfig: Config,
  ) {
    super(
        'roll',
        'Roll',
        {count: integerParser()},
        context,
    );

    this.addSetup(this.handleTrigger$);
  }

  @cache()
  private get handleTrigger$(): Observable<unknown> {
    const faceIndex$$ = this.context.state$.pipe(
        map(state => state.payload.faceIndex),
    );

    return this.onTrigger$.pipe(
        withLatestFrom(this.faceCount$, faceIndex$$, $random.get(this.context.personaContext.vine)),
        map(([, count, faceIndex$, random]) => {
          const randomValue = random.next();
          const nextIndex = Math.floor(randomValue * count);
          faceIndex$.next(nextIndex);
        }),
    );
  }

  @cache()
  private get faceCount$(): Observable<number> {
    return this.config$.pipe(
        map(config => config.count ?? this.defaultConfig.count),
    );
  }
}

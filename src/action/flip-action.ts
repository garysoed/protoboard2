import { cache } from 'gs-tools/export/data';
import { integerParser } from 'persona';
import { Observable } from 'rxjs';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { Logger } from 'santa';

import { ActionContext, BaseAction } from '../core/base-action';

import { OrientablePayload } from './payload/orientable-payload';

const LOGGER = new Logger('pb.FlipAction');


interface Config {
  readonly count: number;
}

export const KEY = 'flip';

export class FlipAction extends BaseAction<OrientablePayload, Config> {
  constructor(
      context: ActionContext<OrientablePayload>,
      private readonly defaultConfig: Config,
  ) {
    super(
        KEY,
        'Flip',
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

    const faceIndex$ = faceIndex$$.pipe(switchMap(faceIndex$ => faceIndex$));

    return this.onTrigger$.pipe(
        withLatestFrom(faceIndex$$, faceIndex$, this.faceCount$),
        tap(([, faceIndex$, faceIndex, faceCount]) => {
          faceIndex$.next((faceIndex + 1) % faceCount);
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

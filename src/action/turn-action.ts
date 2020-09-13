import { cache } from 'gs-tools/export/data';
import { integerParser } from 'persona';
import { NEVER, Observable } from 'rxjs';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { Logger } from 'santa';

import { ActionContext, BaseAction } from '../core/base-action';

import { OrientablePayload } from './payload/orientable-payload';

const LOGGER = new Logger('pb.FlipAction');


interface Config {
  readonly count: number;
}

export const KEY = 'turn';

/**
 * Lets the user turn the object to reveal different faces.
 *
 * @thModule action
 */
export class TurnAction extends BaseAction<OrientablePayload, Config> {
  constructor(
      context: ActionContext<OrientablePayload>,
      defaultConfig: Config,
  ) {
    super(
        KEY,
        'Turn',
        {count: integerParser()},
        context,
        defaultConfig,
    );

    this.addSetup(this.handleTrigger$);
  }

  @cache()
  private get handleTrigger$(): Observable<unknown> {
    return NEVER;
    // TODO
    // const faceIndex$ = this.context.state$.pipe(
    //     map(state => state.payload.faceIndex),
    // );

    // return this.onTrigger$.pipe(
    //     withLatestFrom(faceIndex$, faceIndex$, this.faceCount$),
    //     tap(([, faceIndex$, faceIndex, faceCount]) => {
    //       faceIndex$.next((faceIndex + 1) % faceCount);
    //     }),
    // );
  }

  @cache()
  private get faceCount$(): Observable<number> {
    return this.config$.pipe(map(config => config.count));
  }
}

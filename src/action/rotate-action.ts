import { cache } from 'gs-tools/export/data';
import { identity } from 'nabu';
import { listParser } from 'persona';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { Logger } from 'santa';

import { ActionContext, BaseAction } from '../core/base-action';

import { RotatablePayload } from './payload/rotatable-payload';

const LOGGER = new Logger('pb.RotateAction');


interface Config {
  readonly stops: readonly number[];
}

/**
 * Lets the user rotate the object on the same face.
 *
 * @thModule action
 */
export class RotateAction extends BaseAction<RotatablePayload, Config> {
  constructor(
      context: ActionContext<RotatablePayload>,
      private readonly defaultConfig: Config,
  ) {
    super(
        'rotate',
        'Rotate',
        {stops: listParser(identity<number>())},
        context,
    );

    this.addSetup(this.handleTrigger$);
    this.addSetup(this.renderIndex$);
  }

  private get handleTrigger$(): Observable<unknown> {
    return this.onTrigger$.pipe(
        withLatestFrom(this.context.state$),
        map(([, state]) => state.payload.rotationIndex),
        withLatestFrom(this.rotationIndex$, this.stops$),
        tap(([rotationIndex$, rotationIndex, stops]) => {
          rotationIndex$.next((rotationIndex + 1) % stops.length);
        }),
    );
  }

  @cache()
  private get renderIndex$(): Observable<unknown> {
    return combineLatest([
        this.rotationIndex$,
        this.stops$,
        this.context.host$,
    ]).pipe(
        tap(([index, stops, hostEl]) => {
          if (!(hostEl instanceof HTMLElement)) {
            return;
          }

          hostEl.style.transform = `rotateZ(${stops[index % stops.length]}deg)`;
        }),
    );
  }

  @cache()
  private get rotationIndex$(): Observable<number> {
    return this.context.state$.pipe(
        switchMap(state => state.payload.rotationIndex),
    );
  }

  @cache()
  private get stops$(): Observable<readonly number[]> {
    return this.config$.pipe(
        map(config => config.stops ?? this.defaultConfig.stops),
    );
  }
}

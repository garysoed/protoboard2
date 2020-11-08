import {cache} from 'gs-tools/export/data';
import {filterNonNull} from 'gs-tools/export/rxjs';
import {$stateService} from 'mask';
import {integerParser} from 'persona';
import {Observable, of as observableOf} from 'rxjs';
import {map, switchMap, take, tap, withLatestFrom} from 'rxjs/operators';
import {Logger} from 'santa';

import {ActionContext, BaseAction} from '../core/base-action';
import {IsMultifaced} from '../payload/is-multifaced';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
export class TurnAction extends BaseAction<IsMultifaced, Config> {
  constructor(
      context: ActionContext<IsMultifaced>,
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
    const stateService$ = $stateService.get(this.context.personaContext.vine);
    return this.onTrigger$.pipe(
        withLatestFrom(this.context.objectSpec$, this.faceCount$, stateService$),
        switchMap(([, objectSpec, faceCount, stateService]) => {
          if (!objectSpec) {
            return observableOf(null);
          }

          const $faceIndex = objectSpec.payload.$currentFaceIndex;
          return stateService.get($faceIndex).pipe(
              take(1),
              filterNonNull(),
              tap(faceIndex => {
                stateService.set($faceIndex, (faceIndex + 1) % faceCount);
              }),
          );
        }),
    );
  }

  @cache()
  private get faceCount$(): Observable<number> {
    return this.config$.pipe(map(config => config.count));
  }
}

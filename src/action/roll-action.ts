import { cache } from 'gs-tools/export/data';
import { $stateService } from 'mask';
import { integerParser } from 'persona';
import { Observable } from 'rxjs';
import { map, tap, withLatestFrom } from 'rxjs/operators';

import { ActionContext, BaseAction } from '../core/base-action';

import { IsMultifaced } from './payload/is-multifaced';
import { $random } from './util/random';


interface Config {
  readonly count: number;
}

/**
 * Lets the user pick a random face of the object
 */
export class RollAction extends BaseAction<IsMultifaced, Config> {
  constructor(
      context: ActionContext,
      defaultConfig: Config,
  ) {
    super(
        'roll',
        'Roll',
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
        withLatestFrom(
            this.objectSpec$,
            this.faceCount$,
            stateService$,
            $random.get(this.context.personaContext.vine),
        ),
        tap(([, objectSpec, faceCount, stateService, random]) => {
          if (!objectSpec) {
            return;
          }

          const randomValue = random.next();
          const nextIndex = Math.floor(randomValue * faceCount);
          stateService.set(objectSpec.payload.$currentFaceIndex, nextIndex);
        }),
    );
  }

  @cache()
  private get faceCount$(): Observable<number> {
    return this.config$.pipe(map(config => config.count));
  }
}

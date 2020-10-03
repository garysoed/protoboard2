import { cache } from 'gs-tools/export/data';
import { $stateService } from 'mask';
import { integerParser } from 'persona';
import { EMPTY, Observable } from 'rxjs';
import { switchMap, take, withLatestFrom } from 'rxjs/operators';

import { ActionContext, BaseAction } from '../core/base-action';
import { $objectService } from '../objects/object-service';
import { IsContainer } from '../payload/is-container';
import { ACTIVE_ID, ActivePayload } from '../region/active';

import { moveObject } from './util/move-object';


interface Config {
  readonly location: number;
}

/**
 * Lets the user pick up the object.
 *
 * @thModule action
 */
export class PickAction extends BaseAction<IsContainer<'indexed'>, Config> {
  /**
   * @internal
   */
  constructor(
      context: ActionContext<IsContainer<'indexed'>>,
      defaultConfig: Config,
  ) {
    super(
        'pick',
        'Pick',
        {location: integerParser()},
        context,
        defaultConfig,
    );

    this.addSetup(this.handleTrigger$);
  }

  @cache()
  private get handleTrigger$(): Observable<unknown> {
    const activeState$ = $objectService.get(this.context.personaContext.vine).pipe(
        switchMap(service => service.getObjectSpec<ActivePayload>(ACTIVE_ID)),
    );

    return this.onTrigger$
        .pipe(
            withLatestFrom(this.context.objectSpec$, activeState$, this.config$),
            switchMap(([, fromState, activeState, config]) => {
              if (!fromState || !activeState) {
                return EMPTY;
              }

              return $stateService.get(this.context.personaContext.vine).pipe(
                  take(1),
                  switchMap(service => service.get(activeState.payload.$contentSpecs)),
                  take(1),
                  switchMap(activeContents => {
                    return moveObject(
                        fromState.payload,
                        activeState.payload,
                        {index: config.location},
                        {index: activeContents?.length ?? 0},
                        this.context.personaContext.vine,
                    );
                  }),
              );
            }),
        );
  }
}

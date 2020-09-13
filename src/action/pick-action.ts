import { cache } from 'gs-tools/export/data';
import { integerParser } from 'persona';
import { EMPTY, Observable } from 'rxjs';
import { switchMap, withLatestFrom } from 'rxjs/operators';

import { ActionContext, BaseAction } from '../core/base-action';
import { ACTIVE_ID, ActivePayload } from '../region/active';
import { $stateService } from '../state-old/state-service';

import { DroppablePayload } from './payload/droppable-payload';
import { moveObject } from './util/move-object';

interface Config {
  readonly location: number;
}

/**
 * Lets the user pick up the object.
 *
 * @thModule action
 */
export class PickAction extends BaseAction<DroppablePayload, Config> {
  /**
   * @internal
   */
  constructor(
      context: ActionContext<DroppablePayload>,
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
    const activeState$ = $stateService.get(this.context.personaContext.vine).pipe(
        switchMap(service => service.getState<ActivePayload>(ACTIVE_ID)),
    );

    return this.onTrigger$
        .pipe(
            withLatestFrom(this.context.state$, activeState$, this.config$),
            switchMap(([, fromState, activeState, config]) => {
              if (!activeState) {
                return EMPTY;
              }

              return moveObject(
                  fromState,
                  activeState,
                  config.location,
                  -1,
              );
            }),
        );
  }
}

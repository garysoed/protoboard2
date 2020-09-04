import { integerParser } from 'persona';
import { EMPTY, Observable } from 'rxjs';
import { switchMap, withLatestFrom } from 'rxjs/operators';

import { ActionContext, BaseAction } from '../core/base-action';
import { ACTIVE_ID, ActivePayload } from '../region/active';
import { $stateService } from '../state/state-service';

import { DroppablePayload } from './payload/droppable-payload';
import { moveObject } from './util/move-object';


interface Config {
  readonly location: number;
}


/**
 * Lets the user drop an object onto this object.
 *
 * @thModule action
 */
export class DropAction extends BaseAction<DroppablePayload, Config> {
  constructor(
      context: ActionContext<DroppablePayload>,
      defaultConfig: Config,
  ) {
    super(
        'Drop',
        'drop',
        {location: integerParser()},
        context,
        defaultConfig,
    );

    this.addSetup(this.handleTrigger$);
  }

  private get handleTrigger$(): Observable<unknown> {
    const stateService$ = $stateService.get(this.context.personaContext.vine);
    const activeState$ = stateService$.pipe(
        switchMap(service => service.getState<ActivePayload>(ACTIVE_ID)),
    );

    return this.onTrigger$
        .pipe(
            withLatestFrom(activeState$, this.context.state$, this.config$),
            switchMap(([, activeState, toObjectState, config]) => {
              if (!activeState) {
                return EMPTY;
              }

              return moveObject(
                  activeState,
                  toObjectState,
                  -1,
                  config.location,
              );
            }),
        );
  }
}

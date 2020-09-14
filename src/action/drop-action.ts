import { integerParser } from 'persona';
import { EMPTY, Observable } from 'rxjs';
import { switchMap, withLatestFrom } from 'rxjs/operators';

import { ActionContext, BaseAction } from '../core/base-action';
import { $objectService } from '../objects/object-service';
import { ACTIVE_ID, ActivePayload } from '../region/active';

import { IsContainer } from './payload/is-container';
import { moveObject } from './util/move-object';


interface Config {
  readonly location: number;
}


/**
 * Lets the user drop an object onto this object.
 *
 * @thModule action
 */
export class DropAction extends BaseAction<IsContainer, Config> {
  constructor(
      context: ActionContext,
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
    const activeState$ = $objectService.get(this.context.personaContext.vine).pipe(
        switchMap(service => service.getObjectSpec<ActivePayload>(ACTIVE_ID)),
    );

    return this.onTrigger$
        .pipe(
            withLatestFrom(this.objectSpec$, activeState$, this.config$),
            switchMap(([, fromState, activeState, config]) => {
              if (!fromState || !activeState) {
                return EMPTY;
              }

              return moveObject(
                  activeState.payload.$contentIds,
                  fromState.payload.$contentIds,
                  config.location,
                  -1,
                  this.context.personaContext.vine,
              );
            }),
        );
  }
}

import { $stateService } from 'mask';
import { EMPTY, Observable } from 'rxjs';
import { switchMap, take, withLatestFrom } from 'rxjs/operators';

import { ActionContext, BaseAction, TriggerEvent } from '../core/base-action';
import { $objectService } from '../objects/object-service';
import { IsContainer } from '../payload/is-container';
import { ACTIVE_ID, ActivePayload } from '../region/active';

import { moveObject } from './util/move-object';


interface Config {
}


/**
 * Lets the user drop an object onto this object.
 *
 * @thModule action
 */
export class DropAction extends BaseAction<IsContainer<'indexed'>, Config> {
  constructor(
      private readonly locationFn: (event: TriggerEvent) => number,
      context: ActionContext<IsContainer<'indexed'>>,
      defaultConfig: Config,
  ) {
    super(
        'Drop',
        'drop',
        {},
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
            withLatestFrom(this.context.objectSpec$, activeState$, this.config$),
            switchMap(([event, toState, activeState, config]) => {
              if (!toState || !activeState) {
                return EMPTY;
              }

              return $stateService.get(this.context.personaContext.vine).pipe(
                  take(1),
                  switchMap(service => service.get(activeState.payload.$contentSpecs)),
                  take(1),
                  switchMap(activeContents => {
                    const normalizedActiveContents = activeContents ?? [];
                    const movedObjectSpec =
                        normalizedActiveContents[normalizedActiveContents.length - 1];
                    if (!movedObjectSpec) {
                      return EMPTY;
                    }

                    return moveObject(
                        activeState.payload,
                        toState.payload,
                        movedObjectSpec.objectId,
                        {index: this.locationFn(event)},
                        this.context.personaContext.vine,
                    );
                  }),
              );
            }),
        );
  }
}

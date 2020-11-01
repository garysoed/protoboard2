import { $stateService } from 'mask';
import { Observable, combineLatest, of as observableOf } from 'rxjs';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { $objectService } from '../objects/object-service';
import { ACTIVE_ID, ActivePayload } from '../core/active';
import { ActionContext, BaseAction, TriggerEvent } from '../core/base-action';
import { IsContainer } from '../payload/is-container';

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

    const moveObjectFn$ = combineLatest([this.context.objectSpec$, activeState$]).pipe(
        switchMap(([toState, activeState]) => {
          if (!toState || !activeState) {
            return observableOf(null);
          }

          return $stateService.get(this.context.personaContext.vine).pipe(
              switchMap(service => service.get(activeState.payload.$contentSpecs)),
              switchMap(activeContents => {
                const normalizedActiveContents = activeContents ?? [];
                const movedObjectSpec =
                  normalizedActiveContents[normalizedActiveContents.length - 1];
                if (!movedObjectSpec) {
                  return observableOf(null);
                }

                return moveObject(
                    activeState.payload,
                    toState.payload,
                    this.context.personaContext.vine,
                )
                    .pipe(
                        map(fn => {
                          if (!fn) {
                            return null;
                          }

                          return (event: TriggerEvent) => {
                            fn(movedObjectSpec.objectId, {index: this.locationFn(event)});
                          };
                        }),
                    );
              }),
          );
        }),
    );

    return this.onTrigger$
        .pipe(
            withLatestFrom(moveObjectFn$),
            tap(([event, moveObjectFn]) => {
              if (!moveObjectFn) {
                return;
              }

              moveObjectFn(event);
            }),
        );
  }
}

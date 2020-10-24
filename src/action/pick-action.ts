import { cache } from 'gs-tools/export/data';
import { $stateService } from 'mask';
import { combineLatest, Observable, of as observableOf } from 'rxjs';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { ACTIVE_ID, ActivePayload } from '../core/active';
import { ActionContext, BaseAction, TriggerEvent } from '../core/base-action';
import { $objectService } from '../objects/object-service';
import { IsContainer } from '../payload/is-container';

import { moveObject } from './util/move-object';


interface Config { }

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
      private readonly locationFn: (event: TriggerEvent) => number,
      context: ActionContext<IsContainer<'indexed'>>,
      defaultConfig: Config,
  ) {
    super(
        'pick',
        'Pick',
        {},
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

    const moveFn$ = combineLatest([this.context.objectSpec$, activeState$]).pipe(
        switchMap(([fromState, activeState]) => {
          if (!fromState || !activeState) {
            return observableOf(null);
          }

          return $stateService.get(this.context.personaContext.vine).pipe(
              switchMap(service => combineLatest([
                service.get(fromState.payload.$contentSpecs),
                service.get(activeState.payload.$contentSpecs),
              ])),
              switchMap(([fromContents, activeContents]) => {

                return moveObject(
                    fromState.payload,
                    activeState.payload,
                    this.context.personaContext.vine,
                )
                .pipe(
                    map(fn => {
                      if (!fn) {
                        return null;
                      }

                      return (event: TriggerEvent) => {
                        const movedObjectSpec = (fromContents ?? [])[this.locationFn(event)];
                        if (!movedObjectSpec) {
                          return;
                        }

                        fn(movedObjectSpec.objectId, {index: activeContents?.length ?? 0});
                      };
                    }),
                );
              }),
          );
        }),
    );

    return this.onTrigger$
        .pipe(
            withLatestFrom(moveFn$),
            tap(([event, moveFn]) => {
              if (!moveFn) {
                return;
              }

              moveFn(event);
            }),
        );
  }
}

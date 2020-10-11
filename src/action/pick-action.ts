import { cache } from 'gs-tools/export/data';
import { $stateService } from 'mask';
import { integerParser } from 'persona';
import { combineLatest, EMPTY, Observable } from 'rxjs';
import { switchMap, take, withLatestFrom } from 'rxjs/operators';

import { ActionContext, BaseAction, TriggerEvent } from '../core/base-action';
import { $objectService } from '../objects/object-service';
import { IsContainer } from '../payload/is-container';
import { ACTIVE_ID, ActivePayload } from '../core/active';

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

    return this.onTrigger$
        .pipe(
            withLatestFrom(this.context.objectSpec$, activeState$, this.config$),
            switchMap(([event, fromState, activeState, config]) => {
              if (!fromState || !activeState) {
                return EMPTY;
              }

              return $stateService.get(this.context.personaContext.vine).pipe(
                  take(1),
                  switchMap(service => combineLatest([
                    service.get(fromState.payload.$contentSpecs),
                    service.get(activeState.payload.$contentSpecs),
                  ])),
                  take(1),
                  switchMap(([fromContents, activeContents]) => {
                    const movedObjectSpec = (fromContents ?? [])[this.locationFn(event)];
                    if (!movedObjectSpec) {
                      return EMPTY;
                    }

                    return moveObject(
                        fromState.payload,
                        activeState.payload,
                        movedObjectSpec.objectId,
                        {index: activeContents?.length ?? 0},
                        this.context.personaContext.vine,
                    );
                  }),
              );
            }),
        );
  }
}

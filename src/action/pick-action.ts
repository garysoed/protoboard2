import {cache} from 'gs-tools/export/data';
import {$stateService} from 'mask';
import {Observable, combineLatest, of as observableOf} from 'rxjs';
import {map, switchMap, tap, withLatestFrom} from 'rxjs/operators';

import {ActionContext, BaseAction, TriggerEvent} from '../core/base-action';
import {$activeState} from '../objects/getters/root-state';
import {$objectService} from '../objects/object-service';
import {HasParent} from '../payload/has-parent';
import {IsContainer} from '../payload/is-container';


import {moveObject} from './util/move-object';


// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Config { }

/**
 * Lets the user pick up the object.
 *
 * @thModule action
 */
export class PickAction extends BaseAction<HasParent, Config> {
  /**
   * @internal
   */
  constructor(
      private readonly locationFn: (event: TriggerEvent) => number,
      context: ActionContext<HasParent>,
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
    const fromObjectSpec$ = combineLatest([
      this.context.objectSpec$,
      $objectService.get(this.context.personaContext.vine),
    ])
        .pipe(
            switchMap(([state, objectService]) => {
              if (!state) {
                return observableOf(null);
              }

              return objectService.getObjectSpec<IsContainer<'indexed'>>(state.payload.parentObjectId);
            }),
        );

    const moveFn$ = combineLatest([
      this.context.objectSpec$,
      $activeState.get(this.context.personaContext.vine),
      fromObjectSpec$,
    ])
        .pipe(
            switchMap(([fromState, activeState, fromObjectSpec]) => {
              if (!fromState || !activeState || !fromObjectSpec) {
                return observableOf(null);
              }

              return $stateService.get(this.context.personaContext.vine).pipe(
                  switchMap(service => combineLatest([
                    service.get(fromObjectSpec.payload.$contentSpecs),
                    service.get(activeState.payload.$contentSpecs),
                  ])),
                  switchMap(([fromContents, activeContents]) => {
                    return moveObject(
                        fromObjectSpec.payload,
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

import {cache} from 'gs-tools/export/data';
import {$stateService} from 'mask';
import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, switchMap, tap, withLatestFrom} from 'rxjs/operators';

import {ActionContext, BaseAction, TriggerEvent} from '../core/base-action';
import {$activeState, $getContainerOf, $getObjectSpec} from '../objects/getters/root-state';
import {CoordinateTypes} from '../payload/is-container';
import {ContainerSpec} from '../types/container-spec';
import {PieceSpec} from '../types/piece-spec';

import {moveObject} from './util/move-object';


// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Config { }

/**
 * Lets the user pick up the object.
 *
 * @thModule action
 */
export class PickAction extends BaseAction<PieceSpec<any>, Config> {
  /**
   * @internal
   */
  constructor(
      private readonly locationFn: (event: TriggerEvent) => number,
      context: ActionContext<PieceSpec<any>>,
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
      this.context.objectId$,
      $getContainerOf.get(this.vine),
    ])
        .pipe(
            map(([objectId, getContainerOf]) => {
              if (!objectId) {
                return null;
              }
              return getContainerOf(objectId);
            }),
            withLatestFrom($getObjectSpec.get(this.vine)),
            map(([fromObjectId, getObjectSpec]) => {
              if (!fromObjectId) {
                return null;
              }
              return getObjectSpec<ContainerSpec<CoordinateTypes>>(fromObjectId);
            }),
        );

    const moveFn$ = combineLatest([
      this.objectSpec$,
      $activeState.get(this.vine),
      fromObjectSpec$,
    ])
        .pipe(
            switchMap(([fromState, activeState, fromObjectSpec]) => {
              if (!fromState || !activeState || !fromObjectSpec) {
                return observableOf(null);
              }

              return $stateService.get(this.vine).pipe(
                  switchMap(service => combineLatest([
                    service.get(fromObjectSpec.payload.$contentSpecs),
                    service.get(activeState.payload.$contentSpecs),
                  ])),
                  switchMap(([fromContents, activeContents]) => {
                    return moveObject(
                        fromObjectSpec.payload,
                        activeState.payload,
                        this.vine,
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

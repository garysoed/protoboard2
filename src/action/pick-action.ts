import {cache} from 'gs-tools/export/data';
import {$stateService} from 'mask';
import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, switchMap, tap, withLatestFrom} from 'rxjs/operators';

import {ActionContext, BaseAction, TriggerEvent} from '../core/base-action';
import {$activeState, $contentMap, $getObjectSpec} from '../objects/getters/root-state';
import {IsContainer} from '../payload/is-container';

import {moveObject} from './util/move-object';


// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Config { }

/**
 * Lets the user pick up the object.
 *
 * @thModule action
 */
export class PickAction extends BaseAction<{}, Config> {
  /**
   * @internal
   */
  constructor(
      private readonly locationFn: (event: TriggerEvent) => number,
      context: ActionContext<{}>,
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
      $contentMap.get(this.vine),
    ])
        .pipe(
            map(([state, contentMap]) => {
              if (!state) {
                return null;
              }
              const entry = [...contentMap].find(([, contentSet]) => contentSet.has(state.id));
              if (!entry) {
                return null;
              }

              return entry[0];
            }),
            withLatestFrom($getObjectSpec.get(this.vine)),
            map(([fromObjectId, getObjectSpec]) => {
              if (!fromObjectId) {
                return null;
              }
              return getObjectSpec<IsContainer<any>>(fromObjectId);
            }),
        );

    const moveFn$ = combineLatest([
      this.context.objectSpec$,
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

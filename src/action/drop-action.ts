import {$stateService} from 'grapevine';
import {combineLatest, Observable, of as observableOf} from 'rxjs';
import {map, switchMap, tap, withLatestFrom} from 'rxjs/operators';

import {ActionContext, BaseAction, TriggerEvent} from '../core/base-action';
import {$activeSpec} from '../objects/active-spec';
import {ContainerSpec} from '../types/container-spec';

import {moveObject} from './util/move-object';


interface Config {
}


/**
 * Lets the user drop an object onto this object.
 *
 * @thModule action
 */
export class DropAction extends BaseAction<ContainerSpec<unknown, 'indexed'>, Config> {
  constructor(
      private readonly locationFn: (event: TriggerEvent) => number,
      context: ActionContext<ContainerSpec<unknown, 'indexed'>>,
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
    const moveObjectFn$ = combineLatest([
      this.objectSpec$,
      $activeSpec.get(this.vine),
    ])
        .pipe(
            switchMap(([toState, activeState]) => {
              if (!toState || !activeState) {
                return observableOf(null);
              }

              return $stateService.get(this.vine).resolve(activeState.payload.$contentSpecs).pipe(
                  switchMap(activeContents => {
                    const normalizedActiveContents = activeContents ?? [];
                    const movedObjectSpec = normalizedActiveContents[normalizedActiveContents.length - 1];
                    if (!movedObjectSpec) {
                      return observableOf(null);
                    }

                    return moveObject(
                        activeState.payload,
                        toState.payload,
                        this.vine,
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

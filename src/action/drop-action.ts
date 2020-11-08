import { $activeState } from '../objects/getters/root-state';
import { $stateService } from 'mask';
import { ActionContext, BaseAction, TriggerEvent } from '../core/base-action';
import { IsContainer } from '../payload/is-container';
import { Observable, combineLatest, of as observableOf } from 'rxjs';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
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
    const moveObjectFn$ = combineLatest([
      this.context.objectSpec$,
      $activeState.get(this.context.personaContext.vine),
    ])
        .pipe(
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

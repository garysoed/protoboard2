import { $asMap, $map, $pipe } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
import { filterNonNull } from 'gs-tools/export/rxjs';
import { _p, ThemedCustomElementCtrl } from 'mask';
import { attributeIn, host, onDom, PersonaContext, stringParser } from 'persona';
import { combineLatest, EMPTY, fromEvent, merge, Observable, of as observableOf } from 'rxjs';
import { filter, map, mapTo, switchMap, tap } from 'rxjs/operators';
import { Logger } from 'santa';

import { State } from '../state/state';
import { $stateService } from '../state/state-service';

import { ActionContext, BaseAction } from './base-action';
import { TRIGGER_KEYS, TriggerSpec, UnreservedTriggerSpec } from './trigger-spec';


// import { HelpAction } from '../action/help-action';


const LOG = new Logger('protoboard.core.BaseComponent');


export type BaseActionCtor<P extends object, Q extends P> =
    (context: ActionContext<P>) => BaseAction<Q>;

// TODO: DELETE
export const $baseComponent = {
  api: {
    click: onDom('click'),
    mouseout: onDom('mouseout'),
    mouseover: onDom('mouseover'),
    objectId: attributeIn('object-id', stringParser()),
  },
};

const $ = {
  host: host($baseComponent.api),
};

// TODO: Rename?
@_p.baseCustomElement({})
export abstract class BaseComponent<P extends object> extends ThemedCustomElementCtrl {
  constructor(
      private readonly triggerActionMap: ReadonlyMap<UnreservedTriggerSpec, BaseActionCtor<P, P>>,
      context: PersonaContext,
  ) {
    super(context);

    this.setupActions();
  }

  @cache()
  get actionsMap(): ReadonlyMap<TriggerSpec, BaseAction<object>> {
    const allActions: Map<TriggerSpec, BaseAction<object>> = $pipe(
        this.triggerActionMap,
        $map(([triggerSpec, actionProvider]) => {
          const action = actionProvider({
            host$: host({}).getValue(this.context),
            personaContext: this.context,
            objectId$: this.objectId$,
            state$: this.state$.pipe(filterNonNull()),
          });
          return [triggerSpec, action] as [TriggerSpec, BaseAction<object>];
        }),
        $asMap(),
    );
    // TODO
    // const helpAction = new HelpAction(this.triggerActionMap, this.vine);
    // allActions.set(TriggerSpec.QUESTION, helpAction);

    return allActions;
  }

  /**
   * Emits the current object ID of the host element, if any. If not, this doesn't emit any.
   */
  @cache()
  get objectId$(): Observable<string> {
    return $.host._.objectId.getValue(this.context).pipe(
        switchMap(objectId => {
          if (!objectId) {
            LOG.warning('No object-id found');
            return EMPTY;
          }

          return observableOf(objectId);
        }),
    );
  }

  @cache()
  get state$(): Observable<State<P>|null> {
    return combineLatest([
      this.objectId$,
      $stateService.get(this.context.vine),
    ])
    .pipe(
        switchMap(([objectId, stateService]) => {
          return stateService.getState<P>(objectId);
        }),
    );
  }

  private createTriggerClick(): Observable<unknown> {
    return $.host._.click.getValue(this.context);
  }

  private createTriggerKey(specKey: string): Observable<unknown> {
    return merge(
        this.declareInput($.host._.mouseout).pipe(mapTo(false)),
        this.declareInput($.host._.mouseover).pipe(mapTo(true)),
    )
    .pipe(
        switchMap(hovered => {
          return hovered ? fromEvent<KeyboardEvent>(window, 'keydown') : EMPTY;
        }),
        map(event => event.key),
        filter(key => key === specKey),
    );
  }

  private setupActions(): void {
    for (const [trigger, action] of this.actionsMap) {
      this.addSetup(this.setupTriggerFunction(action));
      this.addSetup(this.setupTrigger(trigger, action));
      this.addSetup(action.run());
    }
  }

  private setupTrigger(trigger: TriggerSpec, action: BaseAction<object>): Observable<unknown> {
    const trigger$ = TRIGGER_KEYS.has(trigger) ?
        this.createTriggerKey(trigger) :
        this.createTriggerClick();
    return trigger$
        .pipe(
            tap(() => {
              action.trigger();
            }),
        );
  }

  private setupTriggerFunction(action: BaseAction<object>): Observable<unknown> {
    return this.declareInput($.host)
        .pipe(
            tap(hostEl => {
              Object.assign(hostEl, {[action.key]: () => {
                action.trigger();
              }});
            }),
        );
  }
}

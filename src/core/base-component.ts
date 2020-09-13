import { $asMap, $map, $pipe } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
import { filterNonNull } from 'gs-tools/export/rxjs';
import { _p, ThemedCustomElementCtrl } from 'mask';
import { attributeIn, host, onDom, PersonaContext, stringParser } from 'persona';
import { Input } from 'persona/export/internal';
import { combineLatest, EMPTY, fromEvent, merge, Observable, of as observableOf } from 'rxjs';
import { filter, map, mapTo, switchMap, tap } from 'rxjs/operators';
import { Logger } from 'santa';

import { HelpAction } from '../action/help-action';
import { ObjectSpec } from '../objects/object-spec';
import { $objectSpecMap } from '../objects/object-spec-list';

import { ActionContext, BaseAction } from './base-action';
import { TRIGGER_KEYS, TriggerSpec, UnreservedTriggerSpec } from './trigger-spec';


const LOG = new Logger('protoboard.core.BaseComponent');


export type BaseActionCtor<P extends object, Q extends P> =
    (context: ActionContext<P>) => BaseAction<Q>;

export const $baseComponent = {
  api: {
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
      private readonly targetInput: Input<Element>,
  ) {
    super(context);

    this.setupActions();
  }

  @cache()
  get actionsMap(): ReadonlyMap<TriggerSpec, BaseAction<object>> {
    const actionContext = {
      host$: host({}).getValue(this.context),
      personaContext: this.context,
      objectId$: this.objectId$,
      state$: this.objectSpec$.pipe(filterNonNull()),
    };
    const allActions: Map<TriggerSpec, BaseAction<object>> = $pipe(
        this.triggerActionMap,
        $map(([triggerSpec, actionProvider]) => {
          const action = actionProvider(actionContext);
          return [triggerSpec, action] as [TriggerSpec, BaseAction<object>];
        }),
        $asMap(),
    );
    const helpAction = new HelpAction(actionContext, allActions);
    allActions.set(TriggerSpec.QUESTION, helpAction);

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
  get objectSpec$(): Observable<ObjectSpec<P>|null> {
    return combineLatest([
      this.objectId$,
      $objectSpecMap.get(this.context.vine),
    ])
    .pipe(
        map(([objectId, objectSpecMap]) => {
          return objectSpecMap.get(objectId) as ObjectSpec<P>;
        }),
    );
  }

  private createTriggerClick(): Observable<unknown> {
    return onDom('click')
        .resolve(context => this.targetInput.getValue(context))
        .getValue(this.context);
  }

  private createTriggerKey(specKey: string): Observable<unknown> {
    return merge(
        onDom('mouseout')
            .resolve(context => this.targetInput.getValue(context))
            .getValue(this.context)
            .pipe(mapTo(false)),
        onDom('mouseover')
            .resolve(context => this.targetInput.getValue(context))
            .getValue(this.context)
            .pipe(mapTo(true)),
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

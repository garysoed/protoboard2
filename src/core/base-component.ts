import { $asMap, $map, $pipe } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
import { _p, Keyboard, ThemedCustomElementCtrl } from 'mask';
import { attributeIn, host, onDom, PersonaContext, stringParser } from 'persona';
import { combineLatest, EMPTY, fromEvent, merge, Observable, of as observableOf } from 'rxjs';
import { filter, map, mapTo, switchMap, tap, throttleTime, withLatestFrom } from 'rxjs/operators';
import { Logger } from 'santa';

import { HelpAction } from '../action/help-action';
import { ObjectSpec } from '../objects/object-spec';
import { $objectSpecMap } from '../objects/object-spec-list';

import { ActionContext, BaseAction, TriggerEvent } from './base-action';
import { DetailedTriggerSpec, isKeyTrigger, TriggerSpec, TriggerType, UnreservedTriggerSpec } from './trigger-spec';


const LOG = new Logger('protoboard.core.BaseComponent');

type RawTriggerEvent = (KeyboardEvent|MouseEvent)&TriggerEvent;

export type BaseActionCtor<P> =
    (context: ActionContext<P>) => BaseAction<any>;

export interface ActionSpec<P> {
  readonly trigger: UnreservedTriggerSpec;
  readonly provider: BaseActionCtor<P>;
}

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
export abstract class BaseComponent<P> extends ThemedCustomElementCtrl {
  constructor(
      private readonly triggerActions: ReadonlyArray<ActionSpec<P>>,
      context: PersonaContext,
  ) {
    super(context);

    this.setupActions();
  }

  @cache()
  get actionsMap(): ReadonlyMap<DetailedTriggerSpec<TriggerType>, BaseAction<any>> {
    const actionContext = {
      host$: host({}).getValue(this.context),
      personaContext: this.context,
      objectSpec$: this.objectSpec$,
    };
    const allActions: Map<DetailedTriggerSpec<TriggerType>, BaseAction<any>> = $pipe(
        this.triggerActions,
        $map(({trigger, provider}) => {
          const action = provider(actionContext);
          if (typeof trigger === 'string') {
            return [{type: trigger}, action] as const;
          }
          return [trigger, action] as const;
        }),
        $asMap(),
    );
    const helpAction = new HelpAction(actionContext, allActions);
    allActions.set({type: TriggerType.QUESTION, shift: true}, helpAction);

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
  get objectPayload$(): Observable<P|null> {
    return this.objectSpec$.pipe(map(objectSpec => objectSpec?.payload ?? null));
  }

  @cache()
  get objectSpec$(): Observable<ObjectSpec<P>|null> {
    return combineLatest([
      this.objectId$,
      $objectSpecMap.get(this.context.vine),
    ])
    .pipe(
        map(([objectId, objectSpecMap]) => {
          return (objectSpecMap.get(objectId) || null) as ObjectSpec<P>|null;
        }),
    );
  }

  private createTriggerClick(
      triggerSpec: DetailedTriggerSpec<TriggerSpec>,
  ): Observable<MouseEvent&TriggerEvent> {
    const targetEl = triggerSpec.targetEl ?? host({});
    return onDom<MouseEvent>('click')
        .resolve(context => targetEl.getValue(context))
        .getValue(this.context)
        .pipe(
            map(event => {
              return Object.assign(event, {mouseX: event.offsetX, mouseY: event.offsetY});
            }),
        );
  }

  private createTriggerKey(
      triggerSpec: DetailedTriggerSpec<TriggerType>,
  ): Observable<KeyboardEvent&TriggerEvent> {
    const targetEl = triggerSpec.targetEl ?? host({});
    const onMouseLeave$ = onDom('mouseleave')
        .resolve(context => targetEl.getValue(context))
        .getValue(this.context);
    const onMouseEnter$ = onDom('mouseenter')
        .resolve(context => targetEl.getValue(context))
        .getValue(this.context);
    const onMouseMove$ = onDom<MouseEvent>('mousemove')
        .resolve(context => targetEl.getValue(context))
        .getValue(this.context);
    return merge(
        onMouseLeave$.pipe(mapTo(false)),
        onMouseEnter$.pipe(mapTo(true)),
    )
    .pipe(
        switchMap(hovered => {
          return hovered ? fromEvent<KeyboardEvent>(window, 'keydown') : EMPTY;
        }),
        withLatestFrom(onMouseMove$.pipe(throttleTime(10))),
        filter(([event]) => event.key === triggerSpec.type),
        map(([keyboardEvent, mouseEvent]) => {
          return Object.assign(
              keyboardEvent,
              {mouseX: mouseEvent.offsetX, mouseY: mouseEvent.offsetY});
        }),
    );
  }

  private setupActions(): void {
    for (const [trigger, action] of this.actionsMap) {
      this.addSetup(this.setupTrigger(trigger, action));
      this.addSetup(action.run());
    }
  }

  private setupTrigger(
      triggerSpec: DetailedTriggerSpec<TriggerType>,
      action: BaseAction<object>,
  ): Observable<unknown> {
    const trigger$: Observable<RawTriggerEvent> = isKeyTrigger(triggerSpec.type) ?
        this.createTriggerKey(triggerSpec) :
        this.createTriggerClick(triggerSpec);
    return trigger$
        .pipe(
            filter(event => {
              return event.altKey === (triggerSpec.alt ?? false) &&
                  event.ctrlKey === (triggerSpec.ctrl ?? false) &&
                  event.metaKey === (triggerSpec.meta ?? false) &&
                  event.shiftKey === (triggerSpec.shift ?? false);
            }),
            tap(event => {
              action.trigger(event);
            }),
        );
  }
}

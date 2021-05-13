import {$resolveState} from 'grapevine';
import {$asMap, $map, $pipe} from 'gs-tools/export/collect';
import {cache} from 'gs-tools/export/data';
import {StateId} from 'gs-tools/export/state';
import {BaseThemedCtrl, stateIdParser, _p} from 'mask';
import {attributeIn, host, InputsOf, onDom, PersonaContext} from 'persona';
import {EMPTY, fromEvent, merge, Observable, of as observableOf} from 'rxjs';
import {filter, map, mapTo, switchMap, tap, throttleTime, withLatestFrom} from 'rxjs/operators';
import {Logger} from 'santa';

import {HelpAction} from '../action/help-action';
import {ObjectSpec} from '../types/object-spec';

import {ActionContext, BaseAction, TriggerEvent} from './base-action';
import {DetailedTriggerSpec, isKeyTrigger, TriggerSpec, TriggerType, UnreservedTriggerSpec} from './trigger-spec';


const LOG = new Logger('pb.core.BaseComponent');

type RawTriggerEvent = (KeyboardEvent|MouseEvent)&TriggerEvent;

export type BaseActionCtor<O extends ObjectSpec<any>> =
    (context: ActionContext<O>) => BaseAction<any>;

export interface ActionSpec<O extends ObjectSpec<any>> {
  readonly trigger: UnreservedTriggerSpec;
  readonly provider: BaseActionCtor<O>;
}

export const $baseComponent = {
  api: {
    // TODO: Move to ctor
    objectId: attributeIn('object-id', stateIdParser<ObjectSpec<any>>()),
  },
};

const $ = {
  host: host($baseComponent.api),
};

@_p.baseCustomElement({})
export abstract class BaseComponent<O extends ObjectSpec<any>, S extends typeof $> extends BaseThemedCtrl<S> {
  constructor(
      private readonly triggerActions: ReadonlyArray<ActionSpec<O>>,
      context: PersonaContext,
      spec: S,
  ) {
    super(context, spec);

    this.setupActions();
  }

  @cache()
  private get baseInputs(): InputsOf<typeof $> {
    return this.inputs;
  }

  @cache()
  get actionsMap(): ReadonlyMap<DetailedTriggerSpec<TriggerType>, BaseAction<any>> {
    const actionContext = {
      host: host({}).getSelectable(this.context),
      personaContext: this.context,
      objectId$: (this.baseInputs.host.objectId as Observable<StateId<O>>)
          .pipe(map(id => id ?? null)),
    };
    const allActions: Map<DetailedTriggerSpec<TriggerType>, BaseAction<any>> = new Map($pipe(
        this.triggerActions,
        $map(({trigger, provider}) => {
          const action = provider(actionContext);
          if (typeof trigger === 'string') {
            return [{type: trigger}, action] as const;
          }
          return [trigger, action] as const;
        }),
        $asMap(),
    ));
    const helpAction = new HelpAction(actionContext, allActions);
    allActions.set({type: TriggerType.QUESTION, shift: true}, helpAction);

    return allActions;
  }

  /**
   * Emits the current object ID of the host element, if any. If not, this doesn't emit any.
   */
  @cache()
  get objectId$(): Observable<StateId<O>> {
    return $.host._.objectId.getValue(this.context).pipe(
        switchMap(objectId => {
          if (!objectId) {
            LOG.warning('No object-id found');
            return EMPTY;
          }

          return observableOf(objectId as StateId<O>);
        }),
    );
  }

  @cache()
  get objectSpec$(): Observable<O|undefined> {
    return this.objectId$
        .pipe(
            switchMap(objectId => $resolveState.get(this.context.vine)(objectId)),
        );
  }

  private createTriggerClick(
      triggerSpec: DetailedTriggerSpec<TriggerSpec>,
  ): Observable<MouseEvent&TriggerEvent> {
    const targetEl = triggerSpec.targetEl ?? host({});
    return onDom<MouseEvent>('click')
        .resolve(context => targetEl.getSelectable(context))
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
        .resolve(context => targetEl.getSelectable(context))
        .getValue(this.context);
    const onMouseEnter$ = onDom('mouseenter')
        .resolve(context => targetEl.getSelectable(context))
        .getValue(this.context);
    const onMouseMove$ = onDom<MouseEvent>('mousemove')
        .resolve(context => targetEl.getSelectable(context))
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
      action: BaseAction<O>,
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

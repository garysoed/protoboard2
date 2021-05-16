import {$resolveState} from 'grapevine';
import {$asMap, $asSet, $filterNonNull, $map, $pipe} from 'gs-tools/export/collect';
import {cache} from 'gs-tools/export/data';
import {StateId} from 'gs-tools/export/state';
import {BaseThemedCtrl, stateIdParser, _p} from 'mask';
import {attributeIn, host, onDom, onMutation, PersonaContext} from 'persona';
import {EMPTY, fromEvent, merge, Observable, of} from 'rxjs';
import {filter, map, mapTo, scan, startWith, switchMap, throttleTime, withLatestFrom} from 'rxjs/operators';
import {Logger} from 'santa';

import {HelpAction} from '../action/help-action';
import {ObjectSpec} from '../types/object-spec';

import {BaseAction, TriggerEvent} from './base-action';
import {DetailedTriggerSpec, isKeyTrigger, TriggerSpec, TriggerType, UnreservedTriggerSpec} from './trigger-spec';


const LOG = new Logger('pb.core.BaseComponent');

type RawTriggerEvent = (KeyboardEvent|MouseEvent)&TriggerEvent;

export type BaseActionCtor = () => BaseAction<any, {}>;

export interface ActionSpec {
  readonly trigger: UnreservedTriggerSpec;
  readonly provider: BaseActionCtor;
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
      private readonly triggerActions: readonly ActionSpec[],
      context: PersonaContext,
      spec: S,
  ) {
    super(context, spec);

    this.setupActions();
  }

  @cache()
  get actionsMap(): ReadonlyMap<DetailedTriggerSpec<TriggerType>, BaseAction<any, {}>> {
    const allActions: Map<DetailedTriggerSpec<TriggerType>, BaseAction<any, {}>> = new Map($pipe(
        this.triggerActions,
        $map(({trigger, provider}) => {
          const action = provider();
          if (typeof trigger === 'string') {
            return [{type: trigger}, action] as const;
          }
          return [trigger, action] as const;
        }),
        $asMap(),
    ));
    const helpAction = new HelpAction(allActions);
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

          return of(objectId as StateId<O>);
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

  private getConfig$<C extends {}>(
      action: BaseAction<O, C>,
  ): Observable<Partial<C>> {
    const attributePrefix = `pb-${action.key}-`;
    const attributeFilter = Object.keys(action.converters)
        .map(configKey => `${attributePrefix}${configKey}`);
    const $host = host({
      onMutation: onMutation({attributes: true, attributeFilter}),
    });
    return $host._.onMutation.getValue(this.context).pipe(
        startWith(null),
        map(records => {
          if (!records) {
            return new Set(attributeFilter);
          }

          return $pipe(
              records,
              $map(record => record.attributeName),
              $filterNonNull(),
              $asSet(),
          );
        }),
        map(changedAttributes => {
          const hostEl = $host.getSelectable(this.context);
          const changedConfig: Partial<C> = {};
          for (const attribute of changedAttributes) {
            const rawValue = hostEl.getAttribute(attribute);
            const configKey = attribute.substr(attributePrefix.length) as keyof C;

            const parseResult = action.converters[configKey]
                .convertBackward(rawValue || '');
            if (parseResult.success) {
              changedConfig[configKey] = parseResult.result;
            }
          }

          return changedConfig;
        }),
        scan((config, newConfig) => ({...config, ...newConfig}), {} as Partial<C>),
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
      action: BaseAction<O, {}>,
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
            action.getOperator({
              config$: this.getConfig$(action),
              objectId$: this.objectId$,
              vine: this.context.vine,
            }),
        );
  }
}

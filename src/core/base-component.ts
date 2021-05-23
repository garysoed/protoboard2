import {$resolveState} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {combineLatestObject} from 'gs-tools/export/rxjs';
import {StateId} from 'gs-tools/export/state';
import {mapObject} from 'gs-tools/export/typescript';
import {BaseThemedCtrl, stateIdParser, _p} from 'mask';
import {attributeIn, host, onDom, PersonaContext} from 'persona';
import {INPUT_TYPE, Resolved} from 'persona/export/internal';
import {EMPTY, fromEvent, merge, Observable, of} from 'rxjs';
import {filter, map, mapTo, switchMap, throttleTime, withLatestFrom} from 'rxjs/operators';
import {Logger} from 'santa';

import {ActionSpec, ConfigSpecs, NormalizedTriggerConfig, TriggerConfig} from '../action/action-spec';
import {ObjectSpec} from '../types/object-spec';

import {TriggerEvent} from './trigger-event';
import {DetailedTriggerSpec, isKeyTrigger, TriggerSpec, TriggerType, UnreservedTriggerSpec} from './trigger-spec';


const LOG = new Logger('pb.core.BaseComponent');

type RawTriggerEvent = (KeyboardEvent|MouseEvent)&TriggerEvent;

type ObservableConfig<C> = {readonly [K in keyof C]: Observable<C[K]>};

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
      private readonly actionSpecs: ReadonlyArray<ActionSpec<any>>,
      context: PersonaContext,
      spec: S,
  ) {
    super(context, spec);

    this.setupActions();
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

  private getConfig$<C extends TriggerConfig>(configSpecs: ConfigSpecs<C>): Observable<NormalizedTriggerConfig<C>> {
    const $host = host({...configSpecs});
    const configSpecMap = mapObject<Resolved<Element, ConfigSpecs<C>>, ObservableConfig<C>>(
        $host._,
        <K extends keyof C>(_: K, value: Resolved<Element, ConfigSpecs<C>>[K]) => {
          INPUT_TYPE.assert(value);
          return value.getValue(this.context) as ObservableConfig<C>[K];
        },
    );

    return combineLatestObject(configSpecMap).pipe(
        map(rawConfig => ({
          ...rawConfig,
          trigger: normalizeTrigger(rawConfig.trigger),
        })),
    );
  }

  private setupActions(): void {
    for (const actionSpec of this.actionSpecs) {
      this.addSetup(this.setupTrigger(actionSpec));
    }
  }

  private setupTrigger<C extends TriggerConfig>(
      actionSpec: ActionSpec<C>,
  ): Observable<unknown> {
    const config$ = this.getConfig$(actionSpec.configSpecs);
    return config$.pipe(
        switchMap(config => {
          if (!config.trigger) {
            return EMPTY;
          }

          const triggerSpec = normalizeTrigger(config.trigger);
          const trigger$: Observable<RawTriggerEvent> = isKeyTrigger(triggerSpec.type)
            ? this.createTriggerKey(triggerSpec)
            : this.createTriggerClick(triggerSpec);
          return trigger$.pipe(
              filter(event => {
                return event.altKey === (triggerSpec.alt ?? false)
                    && event.ctrlKey === (triggerSpec.ctrl ?? false)
                    && event.metaKey === (triggerSpec.meta ?? false)
                    && event.shiftKey === (triggerSpec.shift ?? false);
              }),
              actionSpec.action({
                config$,
                objectId$: this.objectId$,
                vine: this.context.vine,
              }),
          );
        }),
    );
  }
}

function normalizeTrigger(trigger: UnreservedTriggerSpec): DetailedTriggerSpec<TriggerType> {
  if (typeof trigger === 'string') {
    return {type: trigger};
  }
  return trigger;
}
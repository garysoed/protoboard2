import {$resolveState} from 'grapevine';
import {$asArray, $asMap, $map, $pipe} from 'gs-tools/export/collect';
import {cache} from 'gs-tools/export/data';
import {extend} from 'gs-tools/export/rxjs';
import {StateId} from 'gs-tools/export/state';
import {BaseThemedCtrl, stateIdParser, _p} from 'mask';
import {attributeIn, host, onDom, PersonaContext} from 'persona';
import {Input} from 'persona/export/internal';
import {combineLatest, EMPTY, fromEvent, merge, Observable, of} from 'rxjs';
import {filter, map, mapTo, switchMap, throttleTime, withLatestFrom} from 'rxjs/operators';
import {Logger} from 'santa';

import {ActionSpec} from '../action/action-spec';
import {helpAction} from '../action/help-action';
import {ObjectSpec} from '../types/object-spec';

import {TriggerEvent} from './base-action';
import {DetailedTriggerSpec, isKeyTrigger, TriggerSpec, TriggerType} from './trigger-spec';


const LOG = new Logger('pb.core.BaseComponent');

type RawTriggerEvent = (KeyboardEvent|MouseEvent)&TriggerEvent;

interface NormalizedActionSpec<C> extends Omit<ActionSpec<C>, 'trigger'> {
  readonly trigger: DetailedTriggerSpec<TriggerType>;
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
      private readonly triggerActions: ReadonlyArray<ActionSpec<{}>>,
      context: PersonaContext,
      spec: S,
  ) {
    super(context, spec);

    this.setupActions();
  }

  @cache()
  get actionsMap(): ReadonlyMap<DetailedTriggerSpec<TriggerType>, NormalizedActionSpec<{}>> {
    const allActions: Array<NormalizedActionSpec<{}>> = $pipe(
        this.triggerActions,
        $map((spec) => {
          const trigger = spec.trigger;
          if (typeof trigger === 'string') {
            return {...spec, trigger: {type: trigger}};
          }
          return {...spec, trigger};
        }),
        $asArray(),
    );
    allActions.push(helpAction(allActions));

    return $pipe(
        allActions,
        $map(spec => [spec.trigger, spec] as const),
        $asMap(),
    );
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
      actionSpec: NormalizedActionSpec<C>,
  ): Observable<C> {
    const $host = host({...actionSpec.configSpecs});
    const configSpecMap: Map<keyof C, Observable<{}>> = new Map();
    for (const key in $host._) {
      configSpecMap.set(
          key,
          ($host._[key] as Input<C[Extract<keyof C, string>]>).getValue(this.context),
      );
    }

    const obsList: Observable<ReadonlyArray<readonly [keyof C, {}]>> = configSpecMap.size <= 0 ?
      of<Array<[keyof C, {}]>>([]) :
      combineLatest($pipe(
          configSpecMap,
          $map(([key, obs]) => obs.pipe(map(value => [key, value] as const))),
          $asArray(),
      ));
    return obsList.pipe(
        map(entries => {
          const partialConfig: Partial<C> = {};
          for (const [key, value] of entries) {
            partialConfig[key] = value as C[keyof C];
          }

          return partialConfig;
        }),
        extend(actionSpec.defaultConfig),
    );
  }

  private setupActions(): void {
    for (const [trigger, actionSpec] of this.actionsMap) {
      this.addSetup(this.setupTrigger(trigger, actionSpec));
    }
  }

  private setupTrigger<C>(
      triggerSpec: DetailedTriggerSpec<TriggerType>,
      actionSpec: NormalizedActionSpec<C>,
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
            actionSpec.action.getOperator({
              config$: this.getConfig$(actionSpec),
              objectId$: this.objectId$,
              vine: this.context.vine,
            }),
        );
  }
}

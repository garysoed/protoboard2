import { $asMap, $map, $pipe } from 'gs-tools/export/collect';
import { cache } from 'gs-tools/export/data';
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
import { DetailedTriggerSpec, isKeyTrigger, TriggerSpec, TriggerType, UnreservedTriggerSpec } from './trigger-spec';


const LOG = new Logger('protoboard.core.BaseComponent');


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
      private readonly targetInput: Input<Element>,
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

  private createTriggerClick(): Observable<MouseEvent> {
    return onDom<MouseEvent>('click')
        .resolve(context => this.targetInput.getValue(context))
        .getValue(this.context);
  }

  private createTriggerKey(triggerKey: TriggerType): Observable<KeyboardEvent> {
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
        filter(event => event.key === triggerKey),
    );
  }

  private setupActions(): void {
    for (const [trigger, action] of this.actionsMap) {
      this.addSetup(this.setupTriggerFunction(action));
      this.addSetup(this.setupTrigger(trigger, action));
      this.addSetup(action.run());
    }
  }

  private setupTrigger(
      trigger: DetailedTriggerSpec<TriggerType>,
      action: BaseAction<object>,
  ): Observable<unknown> {
    const trigger$: Observable<KeyboardEvent|MouseEvent> = isKeyTrigger(trigger.type) ?
        this.createTriggerKey(trigger.type) :
        this.createTriggerClick();
    return trigger$
        .pipe(
            filter(event => {
              return event.altKey === (trigger.alt ?? false) &&
                  event.ctrlKey === (trigger.ctrl ?? false) &&
                  event.metaKey === (trigger.meta ?? false) &&
                  event.shiftKey === (trigger.shift ?? false);
            }),
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

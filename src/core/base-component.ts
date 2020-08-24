import { _p, ThemedCustomElementCtrl } from 'mask';
import { element, host, onDom, PersonaContext } from 'persona';
import { EMPTY, fromEvent, merge, Observable } from 'rxjs';
import { filter, map, mapTo, switchMap, tap } from 'rxjs/operators';

// import { HelpAction } from '../action/help-action';

import { BaseAction } from './base-action';
import { TRIGGER_KEYS, TriggerSpec, UnreservedTriggerSpec } from './trigger-spec';

const $$ = {
  api: {
    click: onDom('click'),
    mouseout: onDom('mouseout'),
    mouseover: onDom('mouseover'),
  },
};

const $ = {
  host: host($$.api),
};

// TODO: Rename?
@_p.baseCustomElement({})
export abstract class BaseComponent extends ThemedCustomElementCtrl {
  constructor(
      private readonly triggerActionMap: ReadonlyMap<UnreservedTriggerSpec, BaseAction>,
      context: PersonaContext,
  ) {
    super(context);

    this.setupActions();
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
    const allActions: Map<TriggerSpec, BaseAction> = new Map(this.triggerActionMap);
    // TODO
    // const helpAction = new HelpAction(this.triggerActionMap, this.vine);
    // allActions.set(TriggerSpec.QUESTION, helpAction);

    for (const [trigger, action] of allActions) {
      this.addSetup(this.setupTriggerFunction(action));
      this.addSetup(this.setupTrigger(trigger, action));
      this.addSetup(action.run());
    }
  }

  private setupTrigger(trigger: TriggerSpec, action: BaseAction): Observable<unknown> {
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

  private setupTriggerFunction(action: BaseAction): Observable<unknown> {
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

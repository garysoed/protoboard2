import { _p, ThemedCustomElementCtrl } from 'mask';
import { element, onDom, PersonaContext } from 'persona';
import { EMPTY, fromEvent, merge, Observable } from 'rxjs';
import { filter, map, mapTo, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';

import { HelpAction } from '../action/help-action';

import { BaseAction } from './base-action';
import { TRIGGER_KEYS, TriggerSpec, UnreservedTriggerSpec } from './trigger-spec';


const $ = {
  host: element({
    click: onDom('click'),
    mouseout: onDom('mouseout'),
    mouseover: onDom('mouseover'),
  }),
};

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
    return $.host._.click.getValue(this.shadowRoot);
  }

  private createTriggerKey(specKey: string): Observable<unknown> {
    return merge(
        $.host._.mouseout.getValue(this.shadowRoot).pipe(mapTo(false)),
        $.host._.mouseover.getValue(this.shadowRoot).pipe(mapTo(true)),
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
    const helpAction = new HelpAction(this.triggerActionMap, this.vine);
    allActions.set(TriggerSpec.QUESTION, helpAction);

    for (const [trigger, action] of allActions) {
      action.setActionTarget(this.shadowRoot);
      this.setupTriggerFunction(action);
      this.setupTrigger(trigger, action);
      this.addDisposable(action);
    }
  }

  private setupTrigger(trigger: TriggerSpec, action: BaseAction): void {
    const trigger$ = TRIGGER_KEYS.has(trigger) ?
        this.createTriggerKey(trigger) :
        this.createTriggerClick();
    trigger$
        .pipe(takeUntil(this.onDispose$))
        .subscribe(() => {
          action.trigger();
        });
  }

  private setupTriggerFunction(action: BaseAction): void {
    $.host.getValue(this.shadowRoot)
        .pipe(takeUntil(this.onDispose$))
        .subscribe(hostEl => {
          Object.assign(hostEl, {[action.key]: () => {
            action.trigger();
          }});
        });
  }
}

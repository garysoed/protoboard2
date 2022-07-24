import {$asArray, $map} from 'gs-tools/export/collect';
import {flattenResolver, ImmutableResolver, MutableResolver} from 'gs-tools/export/state';
import {$pipe} from 'gs-tools/export/typescript';
import {instanceofType} from 'gs-types';
import {renderTheme} from 'mask';
import {Context, Ctrl, iattr, ivalue, oevent} from 'persona';
import {IAttr, IValue, OEvent} from 'persona/export/internal';
import {BehaviorSubject, combineLatest, EMPTY, merge, Observable, of, OperatorFunction, pipe} from 'rxjs';
import {map, startWith, switchMap, withLatestFrom} from 'rxjs/operators';

import {Action} from '../action/action';
import {ActionEvent, ACTION_EVENT} from '../action/action-event';
import {forwardHelpEvent, helpAction} from '../action/help-action';
import {ActionTrigger} from '../action/show-help-event';
import {onTrigger} from '../trigger/trigger';
import {ComponentState} from '../types/component-state';
import {TriggerSpec, TriggerType} from '../types/trigger-spec';


interface ActionInstalledPayload {
  readonly target$: Observable<Element>;
  readonly actionName: string;
  readonly trigger$: Observable<TriggerSpec|null>;
}


export interface BaseComponentSpecType<S> {
  host: {
    readonly label: IAttr<string>;
    readonly onAction: OEvent<ActionEvent>;
    readonly state: IValue<ImmutableResolver<S>|undefined, 'state'>;
  };
}

export function create$baseComponent<S extends ComponentState>(): BaseComponentSpecType<S> {
  return {
    host: {
      label: iattr('label'),
      onAction: oevent(ACTION_EVENT, ActionEvent),
      state: ivalue('state', instanceofType<ImmutableResolver<S>>(Object)),
    },
  };
}


export abstract class BaseComponent<S extends ComponentState> implements Ctrl {
  private readonly installedActionsArray$ = new BehaviorSubject<readonly ActionInstalledPayload[]>([]);

  constructor(
      private readonly $baseComponent: Context<BaseComponentSpecType<S>>,
      private readonly defaultComponentName: string,
  ) { }

  protected installAction<C, I>(
      action: Action<S, C, I>,
      actionName: string,
      target$: Observable<Element>,
      config$: Observable<TriggerSpec&C>,
      onCall$: Observable<I>,
  ): Observable<unknown> {
    this.installedActionsArray$.next([
      ...this.installedActionsArray$.getValue(),
      {
        target$,
        actionName,
        trigger$: config$,
      },
    ]);
    return merge(target$.pipe(onTrigger(config$)), onCall$)
        .pipe(
            action(this.$baseComponent, config$),
            withLatestFrom(this.state._('id')),
            map(([, id]) => new ActionEvent(action, id)),
            this.$baseComponent.host.onAction(),
        );
  }

  protected get state(): ImmutableResolver<S> {
    return flattenResolver(this.$baseComponent.host.state);
  }

  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$baseComponent),
      this.setupHelpAction(),
    ];
  }

  private setupHelpAction(): Observable<unknown> {
    const targetActionsMap$ = this.installedActionsArray$.pipe(
        switchMap(actions => {
          if (actions.length === 0) {
            return of([]);
          }

          const actions$ = actions.map(action => combineLatest([
            action.trigger$,
            action.target$,
          ])
              .pipe(
                  map(([trigger, target]) => ({actionName: action.actionName, trigger, target})),
              ));
          return combineLatest(actions$);
        }),
        map(payloads => {
          const targetActionMap = new Map<Element, ActionTrigger[]>();
          for (const payload of payloads) {
            const triggers = targetActionMap.get(payload.target) ?? [];
            triggers.push(payload);
            targetActionMap.set(payload.target, triggers);
          }
          return targetActionMap;
        }),
        startWith(new Map()),
    );

    return combineLatest([
      targetActionsMap$,
      this.$baseComponent.host.label,
    ]).pipe(
        switchMap(([targetActionMap, componentName]) => {
          const install$list = $pipe(
              targetActionMap,
              $map(([target, actions]) => {
                const config$ = of({
                  helpContent: {actions, componentName: componentName ?? this.defaultComponentName},
                });
                const target$ = of(target);

                const triggerHelp$ = target$.pipe(
                    onTrigger(of({type: TriggerType.QUESTION})),
                    helpAction(this.$baseComponent, config$),
                );
                const forwardHelp$ = target$.pipe(forwardHelpEvent(config$));
                return merge(triggerHelp$, forwardHelp$);
              }),
              $asArray(),
          );

          return merge(...install$list);
        }),
    );
  }

  updateState<T>(
      mapFn: (resolverFrom: ImmutableResolver<S>) => MutableResolver<T>,
  ): OperatorFunction<T, unknown> {
    return pipe(
        withLatestFrom(this.$baseComponent.host.state),
        switchMap(([value, mutable]) => {
          if (!mutable) {
            return EMPTY;
          }

          return of(value).pipe(mapFn(mutable).set());
        }),
    );
  }
}

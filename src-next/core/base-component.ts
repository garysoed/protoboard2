import {flattenResolver, ImmutableResolver, MutableResolver} from 'gs-tools/export/state';
import {instanceofType} from 'gs-types';
import {renderTheme} from 'mask';
import {Context, Ctrl, ivalue, oevent} from 'persona';
import {IValue, OEvent, UnresolvedIO} from 'persona/export/internal';
import {EMPTY, merge, Observable, of, OperatorFunction, pipe} from 'rxjs';
import {map, switchMap, withLatestFrom} from 'rxjs/operators';

import {Action} from '../action/action';
import {onTrigger} from '../trigger/trigger';
import {TriggerEvent, TRIGGER_EVENT} from '../trigger/trigger-event';
import {ComponentState} from '../types/component-state';
import {TriggerSpec} from '../types/trigger-spec';


export interface BaseComponentSpecType<S extends ComponentState> {
  host: {
    readonly onTrigger: UnresolvedIO<OEvent<TriggerEvent>>;
    readonly state: UnresolvedIO<IValue<ImmutableResolver<S>|undefined, 'state'>>;
  };
}

export function create$baseComponent<S extends ComponentState>(): BaseComponentSpecType<S> {
  return {
    host: {
      onTrigger: oevent(TRIGGER_EVENT, TriggerEvent),
      state: ivalue('state', instanceofType<ImmutableResolver<S>>(Object)),
    },
  };
}


// const LOG = new Logger('pb.core.BaseComponent');

export abstract class BaseComponent<S extends ComponentState> implements Ctrl {
  constructor(
      private readonly $baseComponent: Context<BaseComponentSpecType<S>>,
  ) { }

  protected installAction(
      action: Action<S>,
      target$: Observable<HTMLElement>,
      triggerSpec$: Observable<TriggerSpec>,
      onCall$: Observable<unknown>,
  ): Observable<unknown> {
    return merge(target$.pipe(onTrigger(triggerSpec$)), onCall$)
        .pipe(
            action(this.$baseComponent),
            map(() => new TriggerEvent(action)),
            this.$baseComponent.host.onTrigger(),
        );
  }

  protected get state(): ImmutableResolver<S> {
    return flattenResolver(this.$baseComponent.host.state);
  }

  get runs(): ReadonlyArray<Observable<unknown>> {
    return [renderTheme(this.$baseComponent)];
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

  // private setupActions(): void {
  //   this.addSetup(defer(() => {
  //     const obs: Array<Observable<unknown>> = [];
  //     const actionDescriptions: Array<Observable<ActionTrigger>> = [];
  //     for (const actionSpec of this.actions as readonly ActionSpec[]) {
  //       actionDescriptions.push(
  //           actionSpec.triggerSpec$.pipe(
  //               map(trigger => ({actionName: actionSpec.actionName, trigger})),
  //           ),
  //       );
  //       obs.push(this.setupTrigger(actionSpec));
  //     }

  //     const actionTriggers$ = actionDescriptions.length <= 0 ? of([]) : combineLatest(actionDescriptions);
  //     obs.push(this.setupTrigger(this.createActionSpec(
  //         helpAction,
  //         actionTriggers$.pipe(
  //             map(actions => {
  //               const hostEl = this.context.shadowRoot.host;
  //               return {
  //                 helpContent: {
  //                   tag: hostEl.tagName,
  //                   actions,
  //                 },
  //                 targetEl: hostEl,
  //                 trigger: {type: TriggerType.QUESTION, shift: true},
  //               };
  //             }),
  //         ),
  //         'Help',
  //     )));

  //     return merge(...obs);
  //   }));
  // }
}

import {flattenResolver, ImmutableResolver, MutableResolver} from 'gs-tools/export/state';
import {instanceofType} from 'gs-types';
import {renderTheme} from 'mask';
import {Context, Ctrl, ivalue} from 'persona';
import {IValue, UnresolvedIO} from 'persona/export/internal';
import {EMPTY, merge, Observable, of, OperatorFunction, pipe} from 'rxjs';
import {switchMap, withLatestFrom} from 'rxjs/operators';

import {onTrigger} from '../trigger/trigger';
import {ComponentState} from '../types/component-state';
import {TriggerSpec} from '../types/trigger-spec';


type ActionFn<S extends ComponentState> =
    (context: Context<BaseComponentSpecType<S>>) => OperatorFunction<unknown, unknown>;
// type ActionFactory<C extends TriggerConfig, O> = (params: ActionParams<C, O>) => Action;

export interface BaseComponentSpecType<S extends ComponentState> {
  host: {
    readonly state: UnresolvedIO<IValue<ImmutableResolver<S>|undefined, 'state'>>;
  };
}

export function create$baseComponent<S extends ComponentState>(): BaseComponentSpecType<S> {
  return {
    host: {
      state: ivalue('state', instanceofType<ImmutableResolver<S>>(Object)),
    },
  };
}


// const LOG = new Logger('pb.core.BaseComponent');

export abstract class BaseComponent<S extends ComponentState> implements Ctrl {
  constructor(
      private readonly $baseComponent: Context<BaseComponentSpecType<S>>,
  ) {
    // this.setupActions();
  }

  protected installAction(
      action: ActionFn<S>,
      target$: Observable<HTMLElement>,
      triggerSpec$: Observable<TriggerSpec>,
      onCall$: Observable<unknown>,
  ): Observable<unknown> {
    return merge(target$.pipe(onTrigger(triggerSpec$)), onCall$)
        .pipe(action(this.$baseComponent));
  }

  protected get state(): ImmutableResolver<S> {
    return flattenResolver(this.$baseComponent.host.state);
  }


  // /**
  //  * Emits the current object ID of the host element, if any. If not, this doesn't emit any.
  //  */
  // @cache()
  // get objectPath$(): Observable<ObjectPath<O>> {
  //   return this.objectPathInput.getValue(this.context).pipe(
  //       switchMap(objectPath => {
  //         if (!objectPath) {
  //           LOG.warning('No object-path found');
  //           return EMPTY;
  //         }

  //         return of(objectPath);
  //       }),
  //   );
  // }

  // @cache()
  // get objectSpec$(): ImmutableResolver<O> {
  //   return $stateService.get(this.vine)._(this.objectPath$);
  // }

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

  // private setupTrigger(
  //     actionSpec: ActionSpec,
  // ): Observable<unknown> {
  //   return actionSpec.trigger$.pipe(
  //       actionSpec.action,
  //   );
  // }
}

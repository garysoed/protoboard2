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


export interface BaseComponentSpecType<S> {
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

  protected installAction<C>(
      action: Action<S, C>,
      config$: C,
      target$: Observable<HTMLElement>,
      triggerSpec$: Observable<TriggerSpec>,
      onCall$: Observable<unknown>,
  ): Observable<unknown> {
    return merge(target$.pipe(onTrigger(triggerSpec$)), onCall$)
        .pipe(
            action(this.$baseComponent, config$),
            withLatestFrom(this.state._('id')),
            map(([, id]) => new TriggerEvent(action, id)),
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
}

import {$resolveState} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {StateId} from 'gs-tools/export/state';
import {BaseThemedCtrl, _p} from 'mask';
import {PersonaContext} from 'persona';
import {Input} from 'persona/export/internal';
import {combineLatest, defer, EMPTY, merge, Observable, of, pipe, OperatorFunction} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {Logger} from 'santa';

import {ActionSpec, TriggerConfig} from '../action/action-spec';
import {helpAction} from '../action/help-action';
import {ActionTrigger} from '../action/help-service';
import {createTrigger} from '../action/util/setup-trigger';

import {TriggerEvent} from './trigger-event';


const LOG = new Logger('pb.core.BaseComponent');

interface HostSelector<O> {
  readonly host: {readonly _: {readonly objectId: Input<StateId<O>|undefined>}}
}

@_p.baseCustomElement({})
export abstract class BaseComponent<O, S extends HostSelector<O>> extends BaseThemedCtrl<S> {
  constructor(
      context: PersonaContext,
      spec: S,
  ) {
    super(context, spec);

    this.setupActions();
  }

  protected abstract get actions(): ReadonlyArray<ActionSpec<TriggerConfig>>;

  protected createTrigger(): OperatorFunction<TriggerConfig, TriggerEvent> {
    return pipe(createTrigger(this.context));
  }

  /**
   * Emits the current object ID of the host element, if any. If not, this doesn't emit any.
   */
  @cache()
  get objectId$(): Observable<StateId<O>> {
    return this.inputs.host.objectId.pipe(
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
        .pipe(switchMap(objectId => $resolveState.get(this.context.vine)(objectId)));
  }

  private setupActions(): void {
    this.addSetup(defer(() => {
      const obs: Array<Observable<unknown>> = [];
      const actionDescriptions: Array<Observable<ActionTrigger>> = [];
      for (const actionSpec of this.actions as ReadonlyArray<ActionSpec<TriggerConfig>>) {
        actionDescriptions.push(
            actionSpec.config$.pipe(
                map(config => ({actionName: actionSpec.actionName, trigger: config.trigger})),
            ),
        );
        obs.push(this.setupTrigger(actionSpec));
      }

      const actionDescriptions$ = actionDescriptions.length <= 0 ? of([]) : combineLatest(actionDescriptions);
      const helpActionSpec = helpAction(actionDescriptions$, this.context);
      obs.push(this.setupTrigger(helpActionSpec));

      return merge(...obs);
    }));
  }

  private setupTrigger<C extends TriggerConfig>(
      actionSpec: ActionSpec<C>,
  ): Observable<unknown> {
    return actionSpec.trigger$.pipe(
        actionSpec.action,
    );
  }
}

import {$resolveState} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {StateId} from 'gs-tools/export/state';
import {BaseThemedCtrl, _p} from 'mask';
import {PersonaContext} from 'persona';
import {Input} from 'persona/export/internal';
import {combineLatest, defer, EMPTY, merge, Observable, of, OperatorFunction, pipe} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {Logger} from 'santa';

import {Action, ActionParams, ActionSpec, TriggerConfig} from '../action/action-spec';
import {helpAction} from '../action/help-action';
import {ActionTrigger} from '../action/help-service';
import {createTrigger} from '../action/util/setup-trigger';

import {TriggerEvent} from './trigger-event';
import {TriggerType} from './trigger-spec';


type ActionFactory<C extends TriggerConfig, O> = (params: ActionParams<C, O>) => Action;


const LOG = new Logger('pb.core.BaseComponent');

@_p.baseCustomElement({})
export abstract class BaseComponent<O, S> extends BaseThemedCtrl<S> {
  constructor(
      context: PersonaContext,
      spec: S,
      private readonly objectIdInput: Input<StateId<O>|undefined>,
  ) {
    super(context, spec);

    this.setupActions();
  }

  protected abstract get actions(): readonly ActionSpec[];

  protected createActionSpec<C extends TriggerConfig>(
      factory: ActionFactory<C, O>,
      config$: Observable<C>,
      actionName: string,
  ): ActionSpec {
    return {
      action: factory({config$, objectId$: this.objectId$, vine: this.vine}),
      actionName,
      triggerSpec$: config$.pipe(map(({trigger}) => trigger)),
      trigger$: config$.pipe(createTrigger(this.context)),
    };
  }

  protected createTrigger(): OperatorFunction<TriggerConfig, TriggerEvent> {
    return pipe(createTrigger(this.context));
  }

  /**
   * Emits the current object ID of the host element, if any. If not, this doesn't emit any.
   */
  @cache()
  get objectId$(): Observable<StateId<O>> {
    return this.objectIdInput.getValue(this.context).pipe(
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
      for (const actionSpec of this.actions as readonly ActionSpec[]) {
        actionDescriptions.push(
            actionSpec.triggerSpec$.pipe(
                map(trigger => ({actionName: actionSpec.actionName, trigger})),
            ),
        );
        obs.push(this.setupTrigger(actionSpec));
      }

      const actionTriggers$ = actionDescriptions.length <= 0 ? of([]) : combineLatest(actionDescriptions);
      obs.push(this.setupTrigger(this.createActionSpec(
          helpAction,
          actionTriggers$.pipe(
              map(actionTriggers => ({
                actionTriggers,
                trigger: {type: TriggerType.QUESTION, shift: true},
              })),
          ),
          'Help',
      )));

      return merge(...obs);
    }));
  }

  private setupTrigger(
      actionSpec: ActionSpec,
  ): Observable<unknown> {
    return actionSpec.trigger$.pipe(
        actionSpec.action,
    );
  }
}

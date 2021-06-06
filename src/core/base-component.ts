import {$resolveState} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {StateId} from 'gs-tools/export/state';
import {BaseThemedCtrl, stateIdParser, _p} from 'mask';
import {attributeIn, host, PersonaContext} from 'persona';
import {combineLatest, defer, EMPTY, merge, Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {Logger} from 'santa';

import {ActionSpec, TriggerConfig} from '../action/action-spec';
import {helpAction} from '../action/help-action';
import {ActionTrigger} from '../action/help-service';


const LOG = new Logger('pb.core.BaseComponent');


export const $baseComponent = {
  api: {
    // TODO: Move to ctor
    objectId: attributeIn('object-id', stateIdParser<unknown>()),
  },
};

const $ = {
  host: host($baseComponent.api),
};

@_p.baseCustomElement({})
export abstract class BaseComponent<O, S extends typeof $> extends BaseThemedCtrl<S> {
  constructor(
      context: PersonaContext,
      spec: S,
  ) {
    super(context, spec);

    this.setupActions();
  }

  protected abstract get actions(): ReadonlyArray<ActionSpec<TriggerConfig>>;

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
      const helpActionSpec = helpAction(actionDescriptions$);
      obs.push(this.setupTrigger(helpActionSpec));

      return merge(...obs);
    }));
  }

  private setupTrigger<C extends TriggerConfig>(
      actionSpec: ActionSpec<C>,
  ): Observable<unknown> {
    return actionSpec.action({
      objectId$: this.objectId$,
      personaContext: this.context,
    });
  }
}
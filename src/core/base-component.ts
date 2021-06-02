import {$resolveState} from 'grapevine';
import {cache} from 'gs-tools/export/data';
import {combineLatestObject} from 'gs-tools/export/rxjs';
import {StateId} from 'gs-tools/export/state';
import {mapObject} from 'gs-tools/export/typescript';
import {BaseThemedCtrl, stateIdParser, _p} from 'mask';
import {attributeIn, host, PersonaContext} from 'persona';
import {INPUT_TYPE} from 'persona/export/internal';
import {combineLatest, EMPTY, Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {Logger} from 'santa';

import {ActionSpec, ConfigSpecs, NormalizedTriggerConfig, TriggerConfig} from '../action/action-spec';
import {helpAction} from '../action/help-action';
import {ActionTrigger} from '../action/help-service';
import {createTrigger} from '../action/util/setup-trigger';

import {DetailedTriggerSpec, TriggerType, UnreservedTriggerSpec} from './trigger-spec';


const LOG = new Logger('pb.core.BaseComponent');


type ObservableConfig<C> = {readonly [K in keyof C]: Observable<C[K]>};

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
      private readonly actionSpecs: ReadonlyArray<ActionSpec<any>>,
      context: PersonaContext,
      spec: S,
  ) {
    super(context, spec);

    this.setupActions();
  }

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

  private normalizeConfig<C extends TriggerConfig>(
      configSpecs: ConfigSpecs<C>,
  ): Observable<NormalizedTriggerConfig<C>> {
    const configSpecMap = mapObject<ConfigSpecs<C>, ObservableConfig<C>>(
        configSpecs,
        <K extends keyof C>(_: K, value: ConfigSpecs<C>[K]) => {
          INPUT_TYPE.assert(value);
          return value.getValue(this.context) as ObservableConfig<C>[K];
        },
    );

    return combineLatestObject(configSpecMap).pipe(
        map(rawConfig => ({
          ...rawConfig,
          trigger: normalizeTrigger(rawConfig.trigger),
        })),
    );
  }

  private setupActions(): void {
    const actionDescriptions: Array<Observable<ActionTrigger>> = [];
    for (const actionSpec of this.actionSpecs as ReadonlyArray<ActionSpec<TriggerConfig>>) {
      const config$ = this.normalizeConfig(actionSpec.configSpecs);
      actionDescriptions.push(
          config$.pipe(
              map(config => ({actionName: actionSpec.actionName, trigger: config.trigger})),
          ),
      );
      this.addSetup(this.setupTrigger(actionSpec, config$));
    }

    const actionDescriptions$ = actionDescriptions.length <= 0 ? of([]) : combineLatest(actionDescriptions);
    const helpActionSpec = helpAction(actionDescriptions$);
    const helpConfig$ = this.normalizeConfig(helpActionSpec.configSpecs);
    this.addSetup(this.setupTrigger(helpActionSpec, helpConfig$));
  }

  private setupTrigger<C extends TriggerConfig>(
      actionSpec: ActionSpec<C>,
      config$: Observable<NormalizedTriggerConfig<C>>,
  ): Observable<unknown> {
    return createTrigger(config$, this.context).pipe(
        actionSpec.action({
          config$,
          objectId$: this.objectId$,
          vine: this.context.vine,
        }),
    );
  }
}

function normalizeTrigger(trigger: UnreservedTriggerSpec): DetailedTriggerSpec<TriggerType> {
  if (typeof trigger === 'string') {
    return {type: trigger};
  }
  return trigger;
}
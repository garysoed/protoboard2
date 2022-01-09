import {ImmutableResolver} from 'gs-tools/export/state';
import {undefinedType} from 'gs-types';
import {Context, icall, ivalue, RenderSpec} from 'persona';
import {ICall, IValue, UnresolvedIO} from 'persona/export/internal';
import {Observable, OperatorFunction} from 'rxjs';

import {dropAction} from '../action/drop-action';
import {renderContents} from '../render/render-contents';
import {RegionState} from '../types/region-state';
import {TriggerSpec, TriggerType, TRIGGER_SPEC_TYPE} from '../types/trigger-spec';

import {BaseComponent, BaseComponentSpecType, create$baseComponent} from './base-component';


interface BaseRegionSpecType<S extends RegionState> extends BaseComponentSpecType<S> {
  host: {
    readonly state: UnresolvedIO<IValue<ImmutableResolver<S>|undefined, 'state'>>;
    readonly drop: UnresolvedIO<ICall<undefined, 'drop'>>;
    readonly dropConfig: UnresolvedIO<IValue<TriggerSpec, 'dropConfig'>>;
  }
}

export function create$baseRegion<S extends RegionState>(): BaseRegionSpecType<S> {
  return {
    host: {
      ...create$baseComponent<S>().host,
      drop: icall('drop', undefinedType),
      dropConfig: ivalue('dropConfig', TRIGGER_SPEC_TYPE, {type: TriggerType.D}),
    },
  };
}

export abstract class BaseRegion<S extends RegionState> extends BaseComponent<S> {
  constructor(
      private readonly $baseRegion: Context<BaseRegionSpecType<S>>,
  ) {
    super($baseRegion);
  }

  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.runs,
      this.setupRenderContents(),
      this.installAction(
          dropAction,
          this.target$,
          this.$baseRegion.host.dropConfig,
          this.$baseRegion.host.drop,
      ),
    ];
  }

  abstract renderContents(): OperatorFunction<readonly RenderSpec[], unknown>;

  protected abstract get target$(): Observable<HTMLElement>;

  private setupRenderContents(): Observable<unknown> {
    return (this.state as ImmutableResolver<RegionState>).$('contentIds').pipe(
        renderContents(this.$baseRegion.vine),
        this.renderContents(),
    );
  }
}
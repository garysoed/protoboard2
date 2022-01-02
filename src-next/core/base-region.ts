import {ImmutableResolver, MutableResolver} from 'gs-tools/export/state';
import {Context, RenderSpec} from 'persona';
import {IValue, UnresolvedIO} from 'persona/export/internal';
import {EMPTY, Observable, OperatorFunction} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {renderContents} from '../render/render-contents';
import {RegionState} from '../types/region-state';

import {BaseComponent, BaseComponentSpecType} from './base-component';


interface BaseRegionSpecType<S extends RegionState> extends BaseComponentSpecType<S> {
  host: {
    readonly state: UnresolvedIO<IValue<MutableResolver<S>|undefined, 'state'>>;
  }
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
    ];
  }

  abstract renderContents(): OperatorFunction<readonly RenderSpec[], unknown>;

  private setupRenderContents(): Observable<unknown> {
    return this.$baseRegion.host.state.pipe(
        switchMap(state => {
          if (!state) {
            return EMPTY;
          }
          return renderContents(
              (state as ImmutableResolver<RegionState>).$('contentIds'),
              this.$baseRegion.vine,
          );
        }),
        this.renderContents(),
    );
  }
}
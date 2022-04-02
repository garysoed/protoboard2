import {filterNonNullable} from 'gs-tools/export/rxjs';
import {ImmutableResolver, MutableResolver} from 'gs-tools/export/state';
import {undefinedType} from 'gs-types';
import {Context, icall, ievent, ivalue, RenderSpec} from 'persona';
import {IAttr, ICall, IValue, OEvent} from 'persona/export/internal';
import {Observable, OperatorFunction} from 'rxjs';
import {filter, map, switchMap, withLatestFrom} from 'rxjs/operators';

import {ActionEvent, ACTION_EVENT} from '../action/action-event';
import {dropAction} from '../action/drop-action';
import {pickAction} from '../action/pick-action';
import {renderComponent} from '../render/render-component';
import {RegionState} from '../types/region-state';
import {TriggerSpec, TriggerType, TRIGGER_SPEC_TYPE} from '../types/trigger-spec';

import {BaseComponent, BaseComponentSpecType, create$baseComponent} from './base-component';


interface BaseRegionSpecType<S extends RegionState> extends BaseComponentSpecType<S> {
  host: {
    readonly label: IAttr;
    readonly onAction: OEvent<ActionEvent>;
    readonly state: IValue<ImmutableResolver<S>|undefined, 'state'>;
    readonly drop: ICall<undefined, 'drop'>;
    readonly dropConfig: IValue<TriggerSpec, 'dropConfig'>;
  }
}

export type RenderContentFn = (id: {}) => Observable<RenderSpec|null>;

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
      defaultComponentName: string,
  ) {
    super($baseRegion, defaultComponentName);
  }

  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      ...super.runs,
      this.setupRenderContents(),
      this.setupHandlePick(),
      this.installAction(
          dropAction,
          'Drop',
          this.target$,
          this.$baseRegion.host.dropConfig,
          this.$baseRegion.host.drop,
      ),
    ];
  }

  abstract renderContents(renderValuesFn: RenderContentFn): OperatorFunction<ReadonlyArray<{}>, unknown>;

  protected abstract get target$(): Observable<HTMLElement>;

  private setupHandlePick(): Observable<unknown> {
    const contentIds = this.state.$('contentIds') as unknown as MutableResolver<ReadonlyArray<{}>>;
    return this.target$.pipe(
        switchMap(target => ievent(ACTION_EVENT, ActionEvent).resolve(target)),
        filter(event => event.action === pickAction),
        withLatestFrom(contentIds),
        map(([event, contentIds]) => {
          if (contentIds.indexOf(event.id) < 0) {
            return null;
          }

          return contentIds.filter(content => content !== event.id);
        }),
        filterNonNullable(),
        contentIds.set(),
    );
  }

  private setupRenderContents(): Observable<unknown> {
    return (this.state as ImmutableResolver<RegionState>).$('contentIds').pipe(
        this.renderContents(componentId => renderComponent(this.$baseRegion.vine, componentId)),
    );
  }
}
import {cache} from 'gs-tools/export/data';
import {Type} from 'gs-types';
import {Context, DIV, itarget, oforeach, query, registerCustomElement} from 'persona';
import {BehaviorSubject, Observable, OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';

import {BaseRegion, create$baseRegion, RenderContentFn} from '../core/base-region';
import {componentId, ComponentId} from '../id/component-id';
import {RegionState, REGION_STATE_TYPE} from '../types/region-state';

import template from './surface.html';


export interface SurfaceState extends RegionState {}

export const SURFACE_STATE_TYPE: Type<SurfaceState> = REGION_STATE_TYPE;

const $surface = {
  host: {
    ...create$baseRegion<SurfaceState>(SURFACE_STATE_TYPE).host,
  },
  shadow: {
    root: query('#root', DIV, {
      content: oforeach<ComponentId>('#content'),
      target: itarget(),
    }),
  },
};


export function surfaceState(input: Partial<SurfaceState> = {}): SurfaceState {
  return {
    id: componentId({}),
    contentIds: new BehaviorSubject<readonly ComponentId[]>([]),
    ...input,
  };
}


export class Surface extends BaseRegion<SurfaceState> {
  constructor(private readonly $: Context<typeof $surface>) {
    super($, 'Surface');
  }

  renderContents(renderContentFn: RenderContentFn): OperatorFunction<readonly ComponentId[], unknown> {
    return this.$.shadow.root.content(map(id => renderContentFn(id)));
  }

  @cache()
  protected get target$(): Observable<HTMLElement> {
    return this.$.shadow.root.target;
  }
}

export const SURFACE = registerCustomElement({
  ctrl: Surface,
  spec: $surface,
  tag: 'pb-surface',
  template,
});
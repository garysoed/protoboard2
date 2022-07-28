import {cache} from 'gs-tools/export/data';
import {mutableState} from 'gs-tools/export/state';
import {Context, DIV, itarget, oforeach, query, registerCustomElement} from 'persona';
import {Observable, OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';

import {BaseRegion, create$baseRegion, RenderContentFn} from '../core/base-region';
import {ComponentId} from '../id/component-id';
import {RegionState} from '../types/region-state';

import template from './surface.html';


export interface SurfaceState extends RegionState {}

const $surface = {
  host: {
    ...create$baseRegion<SurfaceState>().host,
  },
  shadow: {
    root: query('#root', DIV, {
      content: oforeach<ComponentId<unknown>>('#content'),
      target: itarget(),
    }),
  },
};


export function surfaceState(id: ComponentId<unknown>, input: Partial<SurfaceState> = {}): SurfaceState {
  return {
    id,
    contentIds: mutableState([]),
    ...input,
  };
}


export class Surface extends BaseRegion<SurfaceState> {
  constructor(private readonly $: Context<typeof $surface>) {
    super($, 'Surface');
  }

  renderContents(renderContentFn: RenderContentFn): OperatorFunction<ReadonlyArray<ComponentId<unknown>>, unknown> {
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
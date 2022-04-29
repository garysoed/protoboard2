import {cache} from 'gs-tools/export/data';
import {mutableState} from 'gs-tools/export/state';
import {instanceofType} from 'gs-types';
import {Context, DIV, query, itarget, oforeach, registerCustomElement} from 'persona';
import {Observable, OperatorFunction} from 'rxjs';

import {BaseRegion, create$baseRegion, RenderContentFn} from '../core/base-region';
import {RegionState} from '../types/region-state';

import template from './surface.html';


export interface SurfaceState extends RegionState {}

const $surface = {
  host: {
    ...create$baseRegion<SurfaceState>().host,
  },
  shadow: {
    root: query('#root', DIV, {
      content: oforeach('#content', instanceofType(Object)),
      target: itarget(),
    }),
  },
};


export function slotState(id: {}, input: Partial<SurfaceState> = {}): SurfaceState {
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

  renderContents(renderContentFn: RenderContentFn): OperatorFunction<ReadonlyArray<{}>, unknown> {
    return this.$.shadow.root.content(id => renderContentFn(id));
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
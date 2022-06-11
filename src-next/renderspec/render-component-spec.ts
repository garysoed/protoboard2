import {source, Vine} from 'grapevine';
import {ArraySubject} from 'gs-tools/export/rxjs';

import {ComponentId, getPayload} from '../id/component-id';

import {combineProviders, RenderSpecProvider} from './render-spec-provider';

type RenderComponentSpecProvider = RenderSpecProvider<unknown, ComponentId<unknown>>;

const $componentRenderSpecMap$ = source(() => new ArraySubject<RenderComponentSpecProvider>());

export const $getComponentRenderSpec$ = source(vine => {
  return $componentRenderSpecMap$.get(vine).pipe(combineProviders(getPayload));
});
export function registerComponentRenderSpec(
    vine: Vine,
    provider: RenderComponentSpecProvider,
): void {
  $componentRenderSpecMap$.get(vine).push(provider);
}
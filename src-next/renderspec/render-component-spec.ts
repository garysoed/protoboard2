import {source, Vine} from 'grapevine';
import {ArraySubject} from 'gs-tools/export/rxjs';

import {combineProviders, RenderSpecProvider} from './render-spec-provider';


const $componentRenderSpecMap$ = source(() => new ArraySubject<RenderSpecProvider>());

export const $getComponentRenderSpec$ = source(vine => {
  return $componentRenderSpecMap$.get(vine).pipe(combineProviders());
});
export function registerComponentRenderSpec(
    vine: Vine,
    provider: RenderSpecProvider,
): void {
  $componentRenderSpecMap$.get(vine).push(provider);
}
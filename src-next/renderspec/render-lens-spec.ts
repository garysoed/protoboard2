import {source, Vine} from 'grapevine';
import {ArraySubject} from 'gs-tools/export/rxjs';

import {combineProviders, RenderSpecProvider} from './render-spec-provider';

const $lensRenderSpecMap$ = source(() => new ArraySubject<RenderSpecProvider>());

export const $getLensRenderSpec$ = source(vine => {
  return $lensRenderSpecMap$.get(vine).pipe(
      combineProviders(id => `Lens render spec for ${id} is not available`),
  );
});
export function registerLensRenderSpec(
    vine: Vine,
    provider: RenderSpecProvider,
): void {
  $lensRenderSpecMap$.get(vine).push(provider);
}
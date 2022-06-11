import {source, Vine} from 'grapevine';
import {ArraySubject} from 'gs-tools/export/rxjs';

import {combineProviders, RenderSpecProvider} from './render-spec-provider';

type RenderLensSpecProvider = RenderSpecProvider<unknown, unknown>;

const $lensRenderSpecMap$ = source(() => new ArraySubject<RenderLensSpecProvider>());

export const $getLensRenderSpec$ = source(vine => {
  return $lensRenderSpecMap$.get(vine).pipe(combineProviders(id => id));
});
export function registerLensRenderSpec(
    vine: Vine,
    provider: RenderLensSpecProvider,
): void {
  $lensRenderSpecMap$.get(vine).push(provider);
}
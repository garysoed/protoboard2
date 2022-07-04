import {source, Vine} from 'grapevine';
import {ArraySubject} from 'gs-tools/export/rxjs';

import {FaceId} from '../id/face-id';

import {combineProviders, RenderSpecProvider} from './render-spec-provider';

type RenderLensSpecProvider = RenderSpecProvider<FaceId<unknown>>;

const $lensRenderSpecMap$ = source(() => new ArraySubject<RenderLensSpecProvider>());

export const $getLensRenderSpec$ = source(vine => {
  return $lensRenderSpecMap$.get(vine).pipe(combineProviders());
});
export function registerLensRenderSpec(
    vine: Vine,
    provider: RenderLensSpecProvider,
): void {
  $lensRenderSpecMap$.get(vine).push(provider);
}
import {source, Vine} from 'grapevine';
import {ArraySubject} from 'gs-tools/export/rxjs';

import {FaceId, getPayload} from '../id/face-id';

import {combineProviders, RenderSpecProvider} from './render-spec-provider';

type RenderLensSpecProvider = RenderSpecProvider<unknown, FaceId<unknown>>;

const $lensRenderSpecMap$ = source(() => new ArraySubject<RenderLensSpecProvider>());

export const $getLensRenderSpec$ = source(vine => {
  return $lensRenderSpecMap$.get(vine).pipe(combineProviders(getPayload));
});
export function registerLensRenderSpec(
    vine: Vine,
    provider: RenderLensSpecProvider,
): void {
  $lensRenderSpecMap$.get(vine).push(provider);
}
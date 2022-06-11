import {source, Vine} from 'grapevine';
import {ArraySubject} from 'gs-tools/export/rxjs';

import {FaceId, getPayload} from '../id/face-id';

import {combineProviders, RenderSpecProvider} from './render-spec-provider';

type RenderFaceSpecProvider = RenderSpecProvider<unknown, FaceId<unknown>>;

const $faceRenderSpecMap$ = source(() => new ArraySubject<RenderFaceSpecProvider>());

export const $getFaceRenderSpec$ = source(vine => {
  return $faceRenderSpecMap$.get(vine).pipe(combineProviders(getPayload));
});
export function registerFaceRenderSpec(
    vine: Vine,
    provider: RenderSpecProvider<unknown, FaceId<unknown>>,
): void {
  $faceRenderSpecMap$.get(vine).push(provider);
}
import {source, Vine} from 'grapevine';
import {ArraySubject} from 'gs-tools/export/rxjs';

import {combineProviders, RenderSpecProvider} from './render-spec-provider';


const $faceRenderSpecMap$ = source(() => new ArraySubject<RenderSpecProvider>());

export const $getFaceRenderSpec$ = source(vine => {
  return $faceRenderSpecMap$.get(vine).pipe(
      combineProviders(id => `Face render spec for ${id} is not available`),
  );
});
export function registerFaceRenderSpec(
    vine: Vine,
    provider: RenderSpecProvider,
): void {
  $faceRenderSpecMap$.get(vine).push(provider);
}
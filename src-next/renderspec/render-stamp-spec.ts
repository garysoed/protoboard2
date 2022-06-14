import {source, Vine} from 'grapevine';
import {ArraySubject} from 'gs-tools/export/rxjs';

import {getPayload, StampId} from '../id/stamp-id';

import {combineProviders, RenderSpecProvider} from './render-spec-provider';

type RenderStampSpecProvider = RenderSpecProvider<unknown, StampId<unknown>>;

const $stampRenderSpecMap$ = source(() => new ArraySubject<RenderStampSpecProvider>());

export const $getStampRenderSpec$ = source(vine => {
  return $stampRenderSpecMap$.get(vine).pipe(combineProviders(getPayload));
});
export function registerStampRenderSpec(
    vine: Vine,
    provider: RenderStampSpecProvider,
): void {
  $stampRenderSpecMap$.get(vine).push(provider);
}

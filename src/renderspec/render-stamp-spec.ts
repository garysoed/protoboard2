import {source, Vine} from 'grapevine';
import {ArraySubject} from 'gs-tools/export/rxjs';
import {ParseType, RenderElementSpec, RenderStringSpec} from 'persona';
import {OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';

import {StampState} from '../region/pad/pad-state';

export type SvgRenderSpec = RenderElementSpec<any, any, SVGElement>|
    RenderStringSpec<ParseType.SVG, any>;
type RenderStampSpecProvider = (stampState: StampState) => SvgRenderSpec|null;

const $stampRenderSpecMap$ = source(() => new ArraySubject<RenderStampSpecProvider>());

export const $getStampRenderSpec$ = source(vine => {
  return $stampRenderSpecMap$.get(vine).pipe(combineProviders());
});
export function registerStampRenderSpec(
    vine: Vine,
    provider: RenderStampSpecProvider,
): void {
  $stampRenderSpecMap$.get(vine).push(provider);
}

export function combineProviders(): OperatorFunction<readonly RenderStampSpecProvider[], RenderStampSpecProvider> {
  return map(providersArray => (state: StampState) => {
    for (const provider of [...providersArray].reverse()) {
      const spec = provider(state);
      if (spec) {
        return spec;
      }
    }

    return null;
  });
}
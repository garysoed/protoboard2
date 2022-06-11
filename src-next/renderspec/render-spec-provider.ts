import {RenderSpec} from 'persona';
import {OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';

export type RenderSpecProvider<P, I> = (payload: P, id: I) => RenderSpec|null;
export type CombinedRenderSpecProvider<I> = (id: I) => RenderSpec|null;

export function combineProviders<P, I>(
    getPayload: (id: I) => P,
): OperatorFunction<ReadonlyArray<RenderSpecProvider<P, I>>, CombinedRenderSpecProvider<I>> {
  return map(providersArray => (id: I) => {
    for (const provider of [...providersArray].reverse()) {
      const spec = provider(getPayload(id), id);
      if (spec) {
        return spec;
      }
    }

    return null;
  });
}
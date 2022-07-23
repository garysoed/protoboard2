import {RenderSpec} from 'persona';
import {OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';

export type RenderSpecProvider<I> = (id: I) => RenderSpec|null;

export function combineProviders<I>():
    OperatorFunction<ReadonlyArray<RenderSpecProvider<I>>, RenderSpecProvider<I>> {
  return map(providersArray => (id: I) => {
    for (const provider of [...providersArray].reverse()) {
      const spec = provider(id);
      if (spec) {
        return spec;
      }
    }

    return null;
  });
}
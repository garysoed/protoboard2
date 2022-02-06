import {RenderSpec} from 'persona';
import {OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';

export type RenderSpecProvider = (id: unknown) => RenderSpec|null;

export function combineProviders(): OperatorFunction<readonly RenderSpecProvider[], (id: unknown) => RenderSpec|null> {
  return map(providersArray => (id: unknown) => {
    for (const provider of [...providersArray].reverse()) {
      const spec = provider(id);
      if (spec) {
        return spec;
      }
    }

    return null;
  });
}
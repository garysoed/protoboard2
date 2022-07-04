import {source, Vine} from 'grapevine';
import {ArraySubject} from 'gs-tools/export/rxjs';
import {Length, LineCap} from 'persona';
import {Observable, OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';

import {LineId} from '../id/line-id';


export interface LineRenderSpec {
  readonly pathLength?: Observable<Length>;
  readonly stroke?: Observable<string>;
  readonly strokeDasharray?: Observable<readonly Length[]>;
  readonly strokeLinecap?: Observable<LineCap>;
  readonly strokeOpacity?: Observable<number>;
  readonly strokeWidth?: Observable<Length>;
}

type RenderLineSpecProvider = (id: LineId<unknown>) => LineRenderSpec|null;

const $lineRenderSpecMap$ = source(() => new ArraySubject<RenderLineSpecProvider>());

export const $getLineRenderSpec$ = source(vine => {
  return $lineRenderSpecMap$.get(vine).pipe(combineProviders());
});
export function registerLineRenderSpec(
    vine: Vine,
    provider: RenderLineSpecProvider,
): void {
  $lineRenderSpecMap$.get(vine).push(provider);
}

export function combineProviders(): OperatorFunction<readonly RenderLineSpecProvider[], RenderLineSpecProvider> {
  return map(providersArray => (id: LineId<unknown>) => {
    for (const provider of [...providersArray].reverse()) {
      const spec = provider(id);
      if (spec) {
        return spec;
      }
    }

    return null;
  });
}
import {source} from 'grapevine';
import {RenderSpec} from 'persona';
import {BehaviorSubject} from 'rxjs';

type GetComponentRenderSpecFn = (id: unknown) => RenderSpec;
export const $getComponentRenderSpec$ = source(() => {
  return new BehaviorSubject<GetComponentRenderSpecFn>(() => {
    throw new Error('Unimplemented: GetComponentRenderSpec');
  });
});
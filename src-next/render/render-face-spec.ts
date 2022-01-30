import {source} from 'grapevine';
import {RenderSpec} from 'persona';
import {BehaviorSubject} from 'rxjs';

type GetFaceRenderSpecFn = (id: unknown) => RenderSpec;

export const $getFaceRenderSpec$ = source(() => {
  return new BehaviorSubject<GetFaceRenderSpecFn>(() => {
    throw new Error('Unimplemented: GetFaceRenderSpec');
  });
});
import {source} from 'grapevine';
import {RenderSpec} from 'persona';
import {BehaviorSubject, Observable} from 'rxjs';

export class LensService {
  private readonly faceId$_ = new BehaviorSubject<{}|null>(null);

  get faceId$(): Observable<{}|null> {
    return this.faceId$_;
  }

  hide(): void {
    this.faceId$_.next(null);
  }

  // TODO: Use IDs for the render specs
  show(key: {}): void {
    this.faceId$_.next(key);
  }
}


export const $lensService = source(() => new LensService());

type GetLensRenderSpecFn = (id: unknown) => RenderSpec;

export const $getLensRenderSpec$ = source(() => {
  return new BehaviorSubject<GetLensRenderSpecFn>(() => {
    throw new Error('Unimplemented: GetFaceRenderSpec');
  });
});
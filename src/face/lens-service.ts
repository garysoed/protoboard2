import {source} from 'grapevine';
import {RenderSpec} from 'persona';
import {BehaviorSubject, Observable} from 'rxjs';


export class LensService {
  private readonly faceSpec$_ = new BehaviorSubject<RenderSpec|null>(null);

  get faceSpec$(): Observable<RenderSpec|null> {
    return this.faceSpec$_;
  }

  hide(): void {
    this.faceSpec$_.next(null);
  }

  show(key: RenderSpec): void {
    this.faceSpec$_.next(key);
  }
}


export const $lensService = source(() => new LensService());

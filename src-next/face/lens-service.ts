import {source} from 'grapevine';
import {BehaviorSubject, Observable} from 'rxjs';


export class LensService {
  private readonly faceId$_ = new BehaviorSubject<unknown>(null);

  get faceId$(): Observable<unknown> {
    return this.faceId$_;
  }

  hide(): void {
    this.faceId$_.next(null);
  }

  show(key: unknown): void {
    this.faceId$_.next(key);
  }
}


export const $lensService = source(() => new LensService());

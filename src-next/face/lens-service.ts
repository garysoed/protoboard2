import {source} from 'grapevine';
import {BehaviorSubject, Observable} from 'rxjs';

import {FaceId} from '../id/face-id';


export class LensService {
  private readonly faceId$_ = new BehaviorSubject<FaceId<unknown>|null>(null);

  get faceId$(): Observable<FaceId<unknown>|null> {
    return this.faceId$_;
  }

  hide(): void {
    this.faceId$_.next(null);
  }

  show(key: FaceId<unknown>): void {
    this.faceId$_.next(key);
  }
}


export const $lensService = source(() => new LensService());

import {source} from 'grapevine';
import {BehaviorSubject, Observable} from 'rxjs';

import {FaceSpec} from '../types/is-multifaced';

export type LensFaceSpec = Pick<FaceSpec, 'renderLensFn'>;

export class LensService {
  private readonly faceSpec$_ = new BehaviorSubject<LensFaceSpec|null>(null);

  get faceSpec$(): Observable<LensFaceSpec|null> {
    return this.faceSpec$_;
  }

  hide(): void {
    this.faceSpec$_.next(null);
  }

  show(key: LensFaceSpec): void {
    this.faceSpec$_.next(key);
  }
}


export const $lensService = source(() => new LensService());

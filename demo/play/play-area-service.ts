import { _v } from '@mask';
import { BehaviorSubject, Observable } from '@rxjs';

class PlayAreaService {
  private readonly tag$ = new BehaviorSubject<string|null>(null);

  getTag(): Observable<string|null> {
    return this.tag$;
  }

  setTag(tag: string): void {
    this.tag$.next(tag);
  }
}

export const $ = _v.source(() => new BehaviorSubject(new PlayAreaService()), globalThis);

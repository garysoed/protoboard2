import { SetDiff, SetSubject } from '@gs-tools/rxjs';
import { _v } from '@mask';
import { BehaviorSubject, Observable } from '@rxjs';

export type DropZoneSpec = Map<string, string>;

class PlayAreaService {
  private readonly dropZones$ = new SetSubject<DropZoneSpec>();
  private readonly tag$ = new BehaviorSubject<string|null>(null);

  addDropZone(spec: DropZoneSpec): void {
    this.dropZones$.add(spec);
  }

  getDropZones(): Observable<SetDiff<DropZoneSpec>> {
    return this.dropZones$;
  }

  getTag(): Observable<string|null> {
    return this.tag$;
  }

  setTag(tag: string): void {
    if (this.tag$.getValue() !== tag) {
      this.dropZones$.next({type: 'init', value: new Set()});
    }
    this.tag$.next(tag);
  }
}

export const $playAreaService = _v.source(
    () => new BehaviorSubject(new PlayAreaService()),
    globalThis,
);

import { source } from 'grapevine';
import { SetDiff, SetSubject } from 'gs-tools/export/rxjs';
import { _v } from 'mask';
import { BehaviorSubject, Observable } from 'rxjs';

export type DropZoneSpec = Map<string, string>;

interface LayoutSpec {
  attr: Map<string, string>;
  tag: string;
}

class PlayAreaService {
  private readonly dropZones$ = new SetSubject<DropZoneSpec>();
  private readonly layout$ = new BehaviorSubject<LayoutSpec|null>(null);

  addDropZone(spec: DropZoneSpec): void {
    this.dropZones$.add(spec);
  }

  getDropZones(): Observable<SetDiff<DropZoneSpec>> {
    return this.dropZones$;
  }

  getLayout(): Observable<LayoutSpec|null> {
    return this.layout$;
  }

  setLayout(layout: LayoutSpec): void {
    const currentLayout = this.layout$.getValue();
    if (!currentLayout || currentLayout.tag !== layout.tag) {
      this.dropZones$.next({type: 'init', value: new Set()});
    }
    this.layout$.next(layout);
  }
}

export const $playAreaService = source(
    () => new BehaviorSubject(new PlayAreaService()),
    globalThis,
);

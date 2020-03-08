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
  private readonly _dropZones$ = new SetSubject<DropZoneSpec>();
  private readonly _layout$ = new BehaviorSubject<LayoutSpec|null>(null);

  addDropZone(spec: DropZoneSpec): void {
    this._dropZones$.add(spec);
  }

  get dropZones$(): Observable<SetDiff<DropZoneSpec>> {
    return this._dropZones$;
  }

  get layout$(): Observable<LayoutSpec|null> {
    return this._layout$;
  }

  setLayout(layout: LayoutSpec): void {
    const currentLayout = this._layout$.getValue();
    if (!currentLayout || currentLayout.tag !== layout.tag) {
      this._dropZones$.next({type: 'init', value: new Set()});
    }
    this._layout$.next(layout);
  }
}

export const $playAreaService = source(
    () => new BehaviorSubject(new PlayAreaService()),
    globalThis,
);

import { source } from 'grapevine';
import { SetDiff, SetSubject } from 'gs-tools/export/rxjs';
import { _v } from 'mask';
import { RenderSpec } from 'persona';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ZoneRender {
  readonly render: RenderSpec;
  readonly zoneAttr: Observable<ReadonlyMap<string, string>>;
}

export type ZoneSpec = {
  readonly tag: string;
  readonly attr: ReadonlyMap<string, string>;
};

export interface LayoutSpec {
  readonly addZoneTag: string|null;
  readonly attr: ReadonlyMap<string, string>;
  readonly tag: string;
  getZoneAttr(addZoneEl: HTMLElement): ReadonlyMap<string, string>;
}

class PlayAreaService {
  private readonly _zones$ = new SetSubject<ZoneSpec>();
  private readonly _layout$ = new BehaviorSubject<LayoutSpec|null>(null);

  addZone(spec: ZoneSpec): void {
    this._zones$.add(spec);
  }

  get zones$(): Observable<SetDiff<ZoneSpec>> {
    return this._zones$;
  }

  get layout$(): Observable<LayoutSpec|null> {
    return this._layout$;
  }

  setLayout(layout: LayoutSpec): void {
    const currentLayout = this._layout$.getValue();
    if (!currentLayout || currentLayout.tag !== layout.tag) {
      this._zones$.next({type: 'init', value: new Set()});
    }
    this._layout$.next(layout);
  }
}

export const $playAreaService = source(() => new PlayAreaService());


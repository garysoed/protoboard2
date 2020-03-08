import { Vine } from 'grapevine';
import { ElementWithTagType } from 'gs-types';
import { $svgConfig, _p, ACTION_EVENT, mapParser, stringParser, TextIconButton, ThemedCustomElementCtrl } from 'mask';
import { api, attributeIn, dispatcher, element, onDom } from 'persona';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil, withLatestFrom } from 'rxjs/operators';

import { Slot } from '../../src/zone/slot';
import addSvg from '../asset/add.svg';
import { $playAreaService, ZoneSpec } from '../play/play-area-service';

import { $$ as $docTemplate, DocTemplate } from './doc-template';
import template from './layout-template.html';


type AddZoneFn = (spec: ZoneSpec) => void;
const ADD_ZONE_EVENT = 'pbd-addZone';

export class AddZoneEvent extends Event {
  constructor(readonly addZone: AddZoneFn) {
    super(ADD_ZONE_EVENT, {bubbles: true});
  }
}

export const $$ = {
  layoutAttr: attributeIn<ReadonlyMap<string, string>>(
      'layout-attr',
      mapParser(stringParser(), stringParser()),
      new Map(),
  ),
  layoutTag: attributeIn('layout-tag', stringParser()),
  onAddZone: dispatcher<AddZoneEvent>(ADD_ZONE_EVENT),
  label: attributeIn('label', stringParser()),
};

const $ = {
  addButton: element('addButton', ElementWithTagType('mk-text-icon-button'), {
    onAddClick: onDom(ACTION_EVENT),
  }),
  host: element($$),
  template: element('template', ElementWithTagType('pbd-doc-template'), api($docTemplate)),
};

@_p.customElement({
  dependencies: [
    DocTemplate,
    Slot,
    TextIconButton,
  ],
  tag: 'pbd-layout-template',
  template,
  configure(vine: Vine): void {
    $svgConfig.get(vine).next({
      key: 'add',
      type: 'set',
      value: {type: 'embed', content: addSvg},
    });
  },
})
export class LayoutTemplate extends ThemedCustomElementCtrl {
  private readonly label$ = this.declareInput($.host._.label);
  private readonly layoutAttr$ = this.declareInput($.host._.layoutAttr);
  private readonly layoutTag$ = this.declareInput($.host._.layoutTag);
  private readonly onAddClick$ = this.declareInput($.addButton._.onAddClick);
  private readonly onAddZone$ = new Subject<ZoneSpec>();
  private readonly playAreaService$ = $playAreaService.get(this.vine);

  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(shadowRoot, vine);

    this.render($.host._.onAddZone).withFunction(this.renderOnAddClick);
    this.render($.template._.label).withObservable(this.label$);
    this.setupHandleAddZone();
  }

  private renderOnAddClick(): Observable<AddZoneEvent> {
    return this.onAddClick$.pipe(
        map(() => new AddZoneEvent(spec => this.onAddZone$.next(spec))),
    );
  }

  private setupHandleAddZone(): void {
    this.onAddZone$.pipe(
        withLatestFrom(this.playAreaService$, this.layoutAttr$, this.layoutTag$),
        takeUntil(this.onDispose$),
    )
    .subscribe(([zone, playAreaService, layoutAttr, layoutTag]) => {
      playAreaService.setLayout({
        attr: new Map(layoutAttr),
        tag: layoutTag,
      });
      playAreaService.addZone(zone);
    });
  }
}

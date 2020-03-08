import { Vine } from 'grapevine';
import { ElementWithTagType } from 'gs-types';
import { $svgConfig, _p, ACTION_EVENT, mapParser, stringParser, TextIconButton, ThemedCustomElementCtrl } from 'mask';
import { api, attributeIn, dispatcher, element, onDom } from 'persona';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil, withLatestFrom } from 'rxjs/operators';

import { DropZone } from '../../src/component/drop-zone';
import addSvg from '../asset/add.svg';
import { $playAreaService, DropZoneSpec } from '../play/play-area-service';

import { $$ as $docTemplate, DocTemplate } from './doc-template';
import template from './layout-template.html';


type AddDropZoneFn = (spec: DropZoneSpec) => void;
const ADD_DROP_ZONE_EVENT = 'pbd-addDropZone';

export class AddDropZoneEvent extends Event {
  constructor(readonly addDropZone: AddDropZoneFn) {
    super(ADD_DROP_ZONE_EVENT, {bubbles: true});
  }
}

export const $$ = {
  layoutAttr: attributeIn<ReadonlyMap<string, string>>(
      'layout-attr',
      mapParser(stringParser(), stringParser()),
      new Map(),
  ),
  layoutTag: attributeIn('layout-tag', stringParser()),
  onAddDropZone: dispatcher<AddDropZoneEvent>(ADD_DROP_ZONE_EVENT),
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
    DropZone,
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
  private readonly onAddDropZone$ = new Subject<DropZoneSpec>();
  private readonly playAreaService$ = $playAreaService.get(this.vine);

  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(shadowRoot, vine);

    this.render($.host._.onAddDropZone).withFunction(this.renderOnAddClick);
    this.render($.template._.label).withObservable(this.label$);
    this.setupHandleAddDropZone();
  }

  private renderOnAddClick(): Observable<AddDropZoneEvent> {
    return this.onAddClick$.pipe(
        map(() => new AddDropZoneEvent(spec => this.onAddDropZone$.next(spec))),
    );
  }

  private setupHandleAddDropZone(): void {
    this.onAddDropZone$.pipe(
        withLatestFrom(this.playAreaService$, this.layoutAttr$, this.layoutTag$),
        takeUntil(this.onDispose$),
    )
    .subscribe(([dropZone, playAreaService, layoutAttr, layoutTag]) => {
      playAreaService.setLayout({
        attr: new Map(layoutAttr),
        tag: layoutTag,
      });
      playAreaService.addDropZone(dropZone);
    });
  }
}

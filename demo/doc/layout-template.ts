import { Vine } from '@grapevine';
import { ElementWithTagType } from '@gs-types';
import { $svgConfig, _p, _v, ACTION_EVENT, stringParser, TextIconButton, ThemedCustomElementCtrl } from '@mask';
import { attributeIn, dispatcher, element, handler, InitFn, onDom } from '@persona';
import { Observable, Subject } from '@rxjs';
import { map, tap, withLatestFrom } from '@rxjs/operators';

import { DropZone } from '../../src/component/drop-zone';
import addSvg from '../asset/add.svg';
import { $playAreaService, DropZoneSpec } from '../play/play-area-service';

import { DocTemplate } from './doc-template';
import template from './layout-template.html';

type AddDropZoneFn = (spec: DropZoneSpec) => void;
const ADD_DROP_ZONE_EVENT = 'pbd-addDropZone';

export class AddDropZoneEvent extends Event {
  constructor(readonly addDropZone: AddDropZoneFn) {
    super(ADD_DROP_ZONE_EVENT, {bubbles: true});
  }
}

export const $$ = {
  layoutTag: attributeIn('layout-tag', stringParser()),
  onAddDropZone: dispatcher<AddDropZoneEvent>(ADD_DROP_ZONE_EVENT),
};

const $ = {
  addButton: element('addButton', ElementWithTagType('mk-text-icon-button'), {
    onAddClick: onDom(ACTION_EVENT),
  }),
  host: element($$),
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
  private readonly layout$ = _p.input($.host._.layoutTag, this);
  private readonly onAddClick$ = _p.input($.addButton._.onAddClick, this);
  private readonly onAddDropZone$ = new Subject<DropZoneSpec>();
  private readonly playAreaService$ = $playAreaService.asSubject();

  getInitFunctions(): InitFn[] {
    return [
      () => this.setupHandleAddDropZone(),
      _p.render($.host._.onAddDropZone).withVine(_v.stream(this.renderOnAddClick, this)),
    ];
  }

  private renderOnAddClick(): Observable<AddDropZoneEvent> {
    return this.onAddClick$.pipe(
        map(() => new AddDropZoneEvent(spec => this.onAddDropZone$.next(spec))),
    );
  }

  private setupHandleAddDropZone(): Observable<unknown> {
    return this.onAddDropZone$.pipe(
        withLatestFrom(this.playAreaService$, this.layout$),
        tap(([, playAreaService, layout]) => playAreaService.setTag(layout)),
        tap(([dropZone, playAreaService]) => playAreaService.addDropZone(dropZone)),
    );
  }
}

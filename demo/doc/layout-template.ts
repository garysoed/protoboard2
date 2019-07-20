import { Vine } from '@grapevine';
import { $svgConfig, _p, stringParser, TextIconButton, ThemedCustomElementCtrl } from '@mask';
import { attributeIn, element, handler, InitFn } from '@persona';
import { Observable } from '@rxjs';
import { tap, withLatestFrom } from '@rxjs/operators';

import addSvg from '../asset/add.svg';
import { $playAreaService, DropZoneSpec } from '../play/play-area-service';

import { DocTemplate } from './doc-template';
import template from './layout-template.html';


const $ = {
  host: element({
    addDropZone: handler<[DropZoneSpec]>('addDropZone'),
    layout: attributeIn('string', stringParser()),
  }),
};

@_p.customElement({
  dependencies: [
    DocTemplate,
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
  private readonly layout$ = _p.input($.host._.layout, this);
  private readonly onAddDropZone$ = _p.input($.host._.addDropZone, this);
  private readonly playAreaService$ = $playAreaService.asSubject();

  getInitFunctions(): InitFn[] {
    return [
      () => this.setupHandleAddDropZone(),
    ];
  }

  private setupHandleAddDropZone(): Observable<unknown> {
    return this.onAddDropZone$.pipe(
        withLatestFrom(this.playAreaService$, this.layout$),
        tap(([, playAreaService, layout]) => playAreaService.setTag(layout)),
        tap(([[dropZone], playAreaService]) => playAreaService.addDropZone(dropZone)),
    );
  }
}

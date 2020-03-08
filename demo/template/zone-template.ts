import { Vine } from 'grapevine';
import { elementWithTagType, instanceofType } from 'gs-types';
import { _p, ACTION_EVENT, stringParser, TextIconButton, ThemedCustomElementCtrl } from 'mask';
import { attributeIn, dispatcher, element, onDom, RenderSpec, single } from 'persona';
import { Observable, of as observableOf } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { $playAreaService, ZoneSpec } from '../play/play-area-service';

import { $$ as $docTemplate, DocTemplate } from './doc-template';
import template from './zone-template.html';

type AddZoneFn = (spec: ZoneSpec) => void;
const ADD_ZONE_EVENT = 'pbd-addZone';

export class AddZoneEvent extends Event {
  constructor(readonly addZone: AddZoneFn) {
    super(ADD_ZONE_EVENT, {bubbles: true});
  }
}


const $$ = {
  tag: 'pbd-zone-template',
  api: {
    label: attributeIn('label', stringParser()),
    onAddZone: dispatcher<AddZoneEvent>(ADD_ZONE_EVENT),
  },
};


const $ = {
  addButton: element('addButton', elementWithTagType('mk-text-icon-button'), {
    onAddClick: onDom(ACTION_EVENT),
  }),
  host: element($$.api),
  layoutContent: element('layoutContent', instanceofType(HTMLDivElement), {
    content: single('content'),
  }),
  template: element('template', $docTemplate, {}),
};

@_p.customElement({
  tag: $$.tag,
  dependencies: [TextIconButton, DocTemplate],
  template,
})
export class ZoneTemplate extends ThemedCustomElementCtrl {
  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(shadowRoot, vine);

    this.render($.template._.label).withObservable(this.declareInput($.host._.label));
    this.render($.layoutContent._.content).withFunction(this.renderLayoutContent);
  }

  private renderLayoutContent(): Observable<RenderSpec|null> {
    return $playAreaService
        .get(this.vine)
        .pipe(
            switchMap(service => service.layout$),
            switchMap(layout => layout?.addZoneRender$ || observableOf(null)),
        );
  }
}

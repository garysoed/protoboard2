import { Vine } from 'grapevine';
import { filterNonNull } from 'gs-tools/export/rxjs';
import { elementWithTagType, instanceofType } from 'gs-types';
import { $textInput, _p, ACTION_EVENT, stringParser, TextIconButton, ThemedCustomElementCtrl } from 'mask';
import { attributeIn, classToggle, dispatcher, element, onDom, RenderSpec, SimpleElementRenderSpec, single } from 'persona';
import { Observable } from 'rxjs';
import { map, switchMap, takeUntil, withLatestFrom } from 'rxjs/operators';

import { $playAreaService, LayoutSpec, ZoneSpec } from '../play/play-area-service';

import { $$ as $docTemplate, DocTemplate } from './doc-template';
import template from './zone-template.html';


type AddZoneFn = (spec: ZoneSpec) => void;
const ADD_ZONE_EVENT = 'pbd-addZone';

export class AddZoneEvent extends Event {
  constructor(readonly addZone: AddZoneFn) {
    super(ADD_ZONE_EVENT, {bubbles: true});
  }
}

const ADD_ZONE_ID = 'addZoneSection';


const $$ = {
  tag: 'pbd-zone-template',
  api: {
    label: attributeIn('label', stringParser()),
    onAddZone: dispatcher<AddZoneEvent>(ADD_ZONE_EVENT),
    tag: attributeIn('tag', stringParser()),
  },
};


const $ = {
  addButton: element('addButton', elementWithTagType('mk-text-icon-button'), {
    onAddClick: onDom(ACTION_EVENT),
  }),
  host: element($$.api),
  layoutContent: element('layoutContent', instanceofType(HTMLDivElement), {
    content: single('#content'),
  }),
  rootContent: element('rootContent', elementWithTagType('section'), {
    hasLayoutClass: classToggle('hasLayout'),
  }),
  template: element('template', $docTemplate, {}),
  x: element('x', $textInput, {}),
  y: element('y', $textInput, {}),
};

@_p.customElement({
  tag: $$.tag,
  dependencies: [TextIconButton, DocTemplate],
  template,
})
export class ZoneTemplate extends ThemedCustomElementCtrl {
  private readonly layoutSpec$ = this.createLayoutSpec();

  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(shadowRoot, vine);

    this.render($.template._.label).withObservable(this.declareInput($.host._.label));
    this.render($.layoutContent._.content).withFunction(this.renderLayoutContent);
    this.render($.rootContent._.hasLayoutClass).withFunction(this.renderHasLayoutClass);
    this.setupHandleAddZone();
  }

  private createLayoutSpec(): Observable<LayoutSpec|null> {
    return $playAreaService
        .get(this.vine)
        .pipe(
            switchMap(service => service.layout$),
        );
  }

  private renderHasLayoutClass(): Observable<boolean> {
    return this.layoutSpec$.pipe(map(spec => !!spec));
  }

  private renderLayoutContent(): Observable<RenderSpec|null> {
    return this.layoutSpec$
        .pipe(
            map(layoutSpec => {
              const tag = layoutSpec?.addZoneTag || null;
              if (!tag) {
                return null;
              }

              return new SimpleElementRenderSpec(
                  tag,
                  new Map([['id', ADD_ZONE_ID]]),
              );
            }),
        );
  }

  private setupHandleAddZone(): void {
    this.declareInput($.addButton._.onAddClick)
        .pipe(
            withLatestFrom(
                this.layoutSpec$,
                this.declareInput($.layoutContent),
                this.declareInput($.host._.tag),
                this.declareInput($.x._.value),
                this.declareInput($.y._.value),
            ),
            map(([, layoutSpec, layoutContentEl, tag, x, y]) => {
              return {
                tag,
                attr: new Map([
                  ...getZoneAttr(layoutSpec, layoutContentEl),
                  ['x', x],
                  ['y', y],
                ]),
              };
            }),
            filterNonNull(),
            withLatestFrom($playAreaService.get(this.vine)),
            takeUntil(this.onDispose$),
        )
        .subscribe(([zoneSpec, playAreaService]) => {
          playAreaService.addZone(zoneSpec);
        });
  }
}

function getZoneAttr(
    layoutSpec: LayoutSpec|null,
    layoutContentEl: HTMLElement,
): ReadonlyMap<string, string> {
  const addZoneEl = layoutContentEl.querySelector(`#${ADD_ZONE_ID}`);
  if (!(addZoneEl instanceof HTMLElement)) {
    return new Map();
  }

  return layoutSpec?.getZoneAttr(addZoneEl) || new Map<string, string>();
}

import { filterByType, filterDefined, filterNonNull } from 'gs-tools/export/rxjs';
import { elementWithTagType, instanceofType, stringType, tupleOfType } from 'gs-types';
import { $textInput, _p, ACTION_EVENT, TextIconButton, ThemedCustomElementCtrl } from 'mask';
import { attributeIn, classToggle, dispatcher, element, host, onDom, PersonaContext, single, stringParser } from 'persona';
import { Observable, of as observableOf } from 'rxjs';
import { map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

// import { $playAreaService, LayoutSpec, ZoneSpec } from '../play/play-area-service';

import { $documentationTemplate, DocumentationTemplate } from './documentation-template';
import template from './zone-template.html';


// type AddZoneFn = (spec: ZoneSpec) => void;
const ADD_ZONE_EVENT = 'pbd-addZone';

// export class AddZoneEvent extends Event {
//   constructor(readonly addZone: AddZoneFn) {
//     super(ADD_ZONE_EVENT, {bubbles: true});
//   }
// }

const ADD_ZONE_ID = 'addZoneSection';


const $$ = {
  tag: 'pbd-container-template',
  api: {
    label: attributeIn('label', stringParser(), ''),
    // onAddZone: dispatcher<AddZoneEvent>(ADD_ZONE_EVENT),
    tag: attributeIn('tag', stringParser()),
  },
};


const $ = {
  addButton: element('addButton', elementWithTagType('mk-text-icon-button'), {
    onAddClick: onDom(ACTION_EVENT),
  }),
  host: host($$.api),
  layoutContent: element('layoutContent', instanceofType(HTMLDivElement), {
    content: single('#content'),
  }),
  rootContent: element('rootContent', elementWithTagType('section'), {
    hasLayoutClass: classToggle('hasLayout'),
  }),
  template: element('template', $documentationTemplate, {}),
  x: element('x', $textInput, {}),
  y: element('y', $textInput, {}),
};

@_p.customElement({
  ...$$,
  dependencies: [TextIconButton, DocumentationTemplate],
  template,
})
export class ContainerTemplate extends ThemedCustomElementCtrl {
  // private readonly layoutSpec$ = this.createLayoutSpec();

  constructor(context: PersonaContext) {
    super(context);

    this.render($.template._.label, this.declareInput($.host._.label));
    // this.render($.layoutContent._.content, this.renderLayoutContent());
    // this.render($.rootContent._.hasLayoutClass, this.renderHasLayoutClass());
    // this.addSetup(this.setupHandleAddZone());
  }

  // private createLayoutSpec(): Observable<LayoutSpec|null> {
  //   return $playAreaService
  //       .get(this.vine)
  //       .pipe(
  //           switchMap(service => service.layout$),
  //       );
  // }

  // private renderHasLayoutClass(): Observable<boolean> {
  //   return this.layoutSpec$.pipe(map(spec => !!spec));
  // }

  // private renderLayoutContent(): Observable<RenderSpec|null> {
  //   return this.layoutSpec$
  //       .pipe(
  //           map(layoutSpec => {
  //             const tag = layoutSpec?.addZoneTag || null;
  //             if (!tag) {
  //               return null;
  //             }

  //             return new SimpleElementRenderSpec(
  //                 tag,
  //                 observableOf(new Map([['id', ADD_ZONE_ID]])),
  //             );
  //           }),
  //       );
  // }

  // private setupHandleAddZone(): Observable<unknown> {
  //   return this.declareInput($.addButton._.onAddClick)
  //       .pipe(
  //           withLatestFrom(
  //               this.declareInput($.x._.value),
  //               this.declareInput($.y._.value),
  //               this.declareInput($.host._.tag),
  //           ),
  //           map(([, x, y, tag]) => [x, y, tag]),
  //           filterByType(tupleOfType([stringType, stringType, stringType])),
  //           withLatestFrom(
  //               this.layoutSpec$,
  //               this.declareInput($.layoutContent),
  //           ),
  //           map(([[x, y, tag], layoutSpec, layoutContentEl]) => {
  //             return {
  //               tag,
  //               attr: new Map([
  //                 ...getZoneAttr(layoutSpec, layoutContentEl),
  //                 ['x', x],
  //                 ['y', y],
  //               ]),
  //             };
  //           }),
  //           filterNonNull(),
  //           withLatestFrom($playAreaService.get(this.vine)),
  //           tap(([zoneSpec, playAreaService]) => {
  //             playAreaService.addZone(zoneSpec);
  //           }),
  //       );
  // }
}

// function getZoneAttr(
//     layoutSpec: LayoutSpec|null,
//     layoutContentEl: HTMLElement,
// ): ReadonlyMap<string, string> {
//   const addZoneEl = layoutContentEl.querySelector(`#${ADD_ZONE_ID}`);
//   if (!(addZoneEl instanceof HTMLElement)) {
//     return new Map();
//   }

//   return layoutSpec?.getZoneAttr(addZoneEl) || new Map<string, string>();
// }

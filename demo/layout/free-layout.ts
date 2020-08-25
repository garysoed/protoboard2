import { elementWithTagType } from 'gs-types';
import { $textInput, _p, TextInput, ThemedCustomElementCtrl } from 'mask';
import { api, element, PersonaContext } from 'persona';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { $$ as $freeLayoutImpl, FreeLayout as FreeLayoutImpl } from '../../src-old/layout/free-layout';
import { $$ as $layoutTemplate, LayoutTemplate } from '../template/layout-template';

import { FreeLayoutAddZone, getZoneAttr } from './free-layout-add-zone';
import template from './free-layout.html';


export const $freeLayout = {
  tag: 'pbd-free-layout',
  api: {},
};

const $ = {
  template: element(
      'template',
      elementWithTagType('pbd-layout-template'),
      api($layoutTemplate.api),
  ),
  x: element('x', elementWithTagType('mk-text-input'), api($textInput.api)),
  y: element('y', elementWithTagType('mk-text-input'), api($textInput.api)),
  height: element('height', elementWithTagType('mk-text-input'), api($textInput.api)),
  width: element('width', elementWithTagType('mk-text-input'), api($textInput.api)),
};

@_p.customElement({
  ...$freeLayout,
  dependencies: [
    FreeLayoutImpl,
    FreeLayoutAddZone,
    LayoutTemplate,
    TextInput,
  ],
  template,
})
export class FreeLayout extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);
    // this.addSetup(this.setupHandleSetLayout());
  }

  // private setupHandleSetLayout(): Observable<unknown> {
  //   return this.declareInput($.template._.onSetLayout)
  //       .pipe(
  //           tap(event => {
  //             event.setLayout({
  //               addZoneTag: 'pbd-free-layout-add-zone',
  //               attr: new Map<string, string>(),
  //               tag: $freeLayoutImpl.tag,
  //               getZoneAttr,
  //             });
  //           }),
  //       );
  // }
}

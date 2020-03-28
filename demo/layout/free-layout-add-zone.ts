import { $textInput, _p, TextInput, ThemedCustomElementCtrl } from 'mask';
import { attributeOut, element, PersonaContext, stringParser } from 'persona';

import template from './free-layout-add-zone.html';


export const $$ = {
  tag: 'pbd-free-layout-add-zone',
  api: {
    width: attributeOut('width', stringParser()),
    height: attributeOut('height', stringParser()),
  },
};

const $ = {
  host: element($$.api),
  width: element('width', $textInput, {}),
  height: element('height', $textInput, {}),
};

@_p.customElement({
  ...$$,
  template,
  dependencies: [
    TextInput,
  ],
})
export class FreeLayoutAddZone extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);

    this.render($.host._.height).withObservable(this.declareInput($.height._.value));
    this.render($.host._.width).withObservable(this.declareInput($.width._.value));
  }
}

export function getZoneAttr(element: HTMLElement): ReadonlyMap<string, string> {
  const width = element.getAttribute($$.api.width.attrName);
  const height = element.getAttribute($$.api.height.attrName);
  return new Map([
    [$$.api.width.attrName, width || ''],
    [$$.api.height.attrName, height || ''],
  ]);
}

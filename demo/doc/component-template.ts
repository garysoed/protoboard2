import { ElementWithTagType } from '@gs-types';
import { _p, stringParser, ThemedCustomElementCtrl } from '@mask';
import { api, attributeIn, element, InitFn } from '@persona';

import template from './component-template.html';
import { $$ as $docTemplate, DocTemplate } from './doc-template';

const $$ = {
  title: attributeIn('title', stringParser()),
};

const $ = {
  host: element($$),
  template: element('template', ElementWithTagType('pbd-doc-template'), api($docTemplate)),
};

@_p.customElement({
  dependencies: [
    DocTemplate,
  ],
  tag: 'pbd-component-template',
  template,
})
export class ComponentTemplate extends ThemedCustomElementCtrl {
  private readonly title$ = _p.input($.host._.title, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      _p.render($.template._.title).withObservable(this.title$),
    ];
  }
}

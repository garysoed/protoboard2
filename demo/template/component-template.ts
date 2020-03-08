import { Vine } from 'grapevine';
import { _p, stringParser, ThemedCustomElementCtrl } from 'mask';
import { attributeIn, element } from 'persona';

import template from './component-template.html';
import { $$ as $docTemplate, DocTemplate } from './doc-template';


const $$ = {
  label: attributeIn('label', stringParser()),
};

const $ = {
  host: element($$),
  template: element('template', $docTemplate, {}),
};

@_p.customElement({
  dependencies: [
    DocTemplate,
  ],
  tag: 'pbd-component-template',
  template,
})
export class ComponentTemplate extends ThemedCustomElementCtrl {
  private readonly label$ = this.declareInput($.host._.label);

  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(shadowRoot, vine);

    this.render($.template._.label).withObservable(this.label$);
  }
}

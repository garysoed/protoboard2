import { _p, ThemedCustomElementCtrl } from 'mask';
import { attributeIn, element, PersonaContext, stringParser } from 'persona';

import template from './component-template.html';
import { $$ as $docTemplate, DocTemplate } from './doc-template';


const $$ = {
  label: attributeIn('label', stringParser(), ''),
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

  constructor(context: PersonaContext) {
    super(context);

    this.render($.template._.label).withObservable(this.label$);
  }
}

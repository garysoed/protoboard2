import { _p, ThemedCustomElementCtrl } from 'mask';
import { attributeIn, element, host, PersonaContext, stringParser } from 'persona';

import template from './component-template.html';
import { $$ as $docTemplate, DocTemplate } from './doc-template';


const $$ = {
  tag: 'pbd-component-template',
  api: {
    label: attributeIn('label', stringParser(), ''),
  },
};

const $ = {
  host: host($$.api),
  template: element('template', $docTemplate, {}),
};

@_p.customElement({
  ...$$,
  dependencies: [
    DocTemplate,
  ],
  template,
})
export class ComponentTemplate extends ThemedCustomElementCtrl {
  private readonly label$ = this.declareInput($.host._.label);

  constructor(context: PersonaContext) {
    super(context);

    this.render($.template._.label, this.label$);
  }
}

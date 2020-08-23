import { _p, ThemedCustomElementCtrl } from 'mask';
import { attributeIn, element, host, PersonaContext, stringParser } from 'persona';

import { $documentationTemplate as $documentationTemplate, DocumentationTemplate } from './documentation-template';
import template from './piece-template.html';


const $$ = {
  tag: 'pbd-piece-template',
  api: {
    label: attributeIn('label', stringParser(), ''),
  },
};

const $ = {
  host: host($$.api),
  template: element('template', $documentationTemplate, {}),
};

@_p.customElement({
  ...$$,
  dependencies: [
    DocumentationTemplate,
  ],
  template,
})
export class PieceTemplate extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);

    this.render($.template._.label, this.declareInput($.host._.label));
  }
}

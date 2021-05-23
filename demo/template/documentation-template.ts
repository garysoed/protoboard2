import {cache} from 'gs-tools/export/data';
import {BaseThemedCtrl, _p} from 'mask';
import {$h3, attributeIn, element, host, PersonaContext, stringParser, textContent} from 'persona';
import {Observable} from 'rxjs';

import template from './documentation-template.html';


export const $documentationTemplate = {
  tag: 'pbd-documentation-template',
  api: {
    label: attributeIn('label', stringParser(), ''),
  },
};

const $ = {
  host: host($documentationTemplate.api),
  title: element('title', $h3, {
    text: textContent(),
  }),
};

@_p.customElement({
  ...$documentationTemplate,
  template,
})
export class DocumentationTemplate extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.title.text(this.inputs.host.label),
    ];
  }
}

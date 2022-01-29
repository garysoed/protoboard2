import {cache} from 'gs-tools/export/data';
import {mapNullableTo} from 'gs-tools/export/rxjs';
import {renderTheme} from 'mask';
import {Context, Ctrl, H3, iattr, id, otext, registerCustomElement} from 'persona';
import {Observable} from 'rxjs';

import template from './documentation-template.html';


const $documentationTemplate = {
  host: {
    label: iattr('label'),
  },
  shadow: {
    title: id('title', H3, {
      text: otext(),
    }),
  },
};

class DocumentationTemplate implements Ctrl {
  constructor(private readonly $: Context<typeof $documentationTemplate>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      this.$.host.label.pipe(mapNullableTo(''), this.$.shadow.title.text()),
    ];
  }
}

export const DOCUMENTATION_TEMPLATE = registerCustomElement({
  ctrl: DocumentationTemplate,
  spec: $documentationTemplate,
  tag: 'pbd-documentation-template',
  template,
});

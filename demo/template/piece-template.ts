import { cache } from 'gs-tools/export/data';
import { debug } from 'gs-tools/export/rxjs';
import { $textIconButton, _p, ACTION_EVENT, ActionEvent, TextIconButton, ThemedCustomElementCtrl } from 'mask';
import { attributeIn, dispatcher, element, host, PersonaContext, stringParser } from 'persona';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { $documentationTemplate as $documentationTemplate, DocumentationTemplate } from './documentation-template';
import template from './piece-template.html';


export const $pieceTemplate = {
  tag: 'pbd-piece-template',
  api: {
    label: attributeIn('label', stringParser(), ''),
    onAdd: dispatcher(ACTION_EVENT),
  },
};

const $ = {
  host: host($pieceTemplate.api),
  addButton: element('addbutton', $textIconButton, {}),
  template: element('template', $documentationTemplate, {}),
};

@_p.customElement({
  ...$pieceTemplate,
  dependencies: [
    DocumentationTemplate,
    TextIconButton,
  ],
  template,
})
export class PieceTemplate extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);

    this.render($.template._.label, this.declareInput($.host._.label));
    this.render($.host._.onAdd, this.onAdd$);
  }

  @cache()
  private get onAdd$(): Observable<Event> {
    return this.declareInput($.addButton._.actionEvent).pipe(map(() => new ActionEvent({})));
  }
}

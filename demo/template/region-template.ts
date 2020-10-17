import { $button, _p, ACTION_EVENT, Button, LineLayout, OverlayLayout, SimpleRadioInput, ThemedCustomElementCtrl } from 'mask';
import { attributeIn, element, host, onDom, PersonaContext, stringParser } from 'persona';

// import { $playAreaService, LayoutSpec, ZoneSpec } from '../play/play-area-service';
import { $documentationTemplate, DocumentationTemplate } from './documentation-template';
import template from './region-template.html';


const $$ = {
  tag: 'pbd-region-template',
  api: {
    label: attributeIn('label', stringParser(), ''),
    tag: attributeIn('tag', stringParser()),
  },
};


const $ = {
  addButton: element('addButton', $button, {
    onAddClick: onDom(ACTION_EVENT),
  }),
  host: host($$.api),
  template: element('template', $documentationTemplate, {}),
};

@_p.customElement({
  ...$$,
  dependencies: [
    Button,
    DocumentationTemplate,
    LineLayout,
    OverlayLayout,
    SimpleRadioInput,
  ],
  template,
})
export class RegionTemplate extends ThemedCustomElementCtrl {

  constructor(context: PersonaContext) {
    super(context);

    this.render($.template._.label, this.declareInput($.host._.label));
  }
}

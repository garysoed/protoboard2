import { cache } from 'gs-tools/export/data';
import { elementWithTagType, instanceofType } from 'gs-types';
import { $button, $drawer, $icon, _p, Button, Drawer, Icon, ListItemLayout, registerSvg, ThemedCustomElementCtrl } from 'mask';
import { api, attributeIn, element, host, PersonaContext, stringParser, textContent } from 'persona';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap, withLatestFrom } from 'rxjs/operators';

import chevronDownSvg from '../asset/chevron_down.svg';
import chevronUpSvg from '../asset/chevron_up.svg';

import template from './documentation-template.html';


export const $documentationTemplate = {
  tag: 'pbd-documentation-template',
  api: {
    label: attributeIn('label', stringParser(), ''),
  },
};

const $ = {
  drawer: element('drawer', elementWithTagType('mk-drawer'), api($drawer.api)),
  drawerButton: element('drawerButton', $button, {}),
  drawerIcon: element('drawerIcon', $icon, {}),
  host: host($documentationTemplate.api),
  title: element('title', instanceofType(HTMLHeadingElement), {
    text: textContent(),
  }),
};

@_p.customElement({
  ...$documentationTemplate,
  configure: vine => {
    registerSvg(vine, 'chevron_down', {type: 'embed', content: chevronDownSvg});
    registerSvg(vine, 'chevron_up', {type: 'embed', content: chevronUpSvg});
  },
  dependencies: [
    Button,
    Drawer,
    Icon,
    ListItemLayout,
  ],
  template,
})
export class DocumentationTemplate extends ThemedCustomElementCtrl {
  private readonly drawerExpanded$ = new BehaviorSubject(false);

  constructor(context: PersonaContext) {
    super(context);

    this.render($.drawer._.expanded, this.drawerExpanded$);
    this.render($.drawerIcon._.icon, this.drawerIcon$);
    this.render($.title._.text, this.declareInput($.host._.label));
    this.addSetup(this.handleDrawerIconClick$);
  }

  @cache()
  private get drawerIcon$(): Observable<string> {
    return this.drawerExpanded$.pipe(map(expanded => expanded ? 'chevron_down' : 'chevron_up'));
  }

  @cache()
  private get handleDrawerIconClick$(): Observable<unknown> {
    return this.declareInput($.drawerButton._.actionEvent)
        .pipe(
            withLatestFrom(this.drawerExpanded$),
            tap(([, expanded]) => this.drawerExpanded$.next(!expanded)),
        );
  }
}

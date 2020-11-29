import {cache} from 'gs-tools/export/data';
import {instanceofType} from 'gs-types';
import {$button, $drawerLayout, $icon, BaseThemedCtrl, Button, DrawerLayout, Icon, ListItemLayout, registerSvg, _p} from 'mask';
import {attributeIn, element, host, PersonaContext, stringParser, textContent} from 'persona';
import {Observable} from 'rxjs';
import {map, scan, startWith} from 'rxjs/operators';

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
  drawer: element('drawer', $drawerLayout, {}),
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
    DrawerLayout,
    Icon,
    ListItemLayout,
  ],
  template,
})
export class DocumentationTemplate extends BaseThemedCtrl<typeof $> {
  constructor(context: PersonaContext) {
    super(context, $);
  }

  @cache()
  protected get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.drawer.expanded(this.drawerExpanded$),
      this.renderers.drawerIcon.icon(this.drawerIcon$),
      this.renderers.title.text(this.inputs.host.label),
    ];
  }

  @cache()
  private get drawerIcon$(): Observable<string> {
    return this.drawerExpanded$.pipe(map(expanded => expanded ? 'chevron_down' : 'chevron_up'));
  }

  @cache()
  private get drawerExpanded$(): Observable<boolean> {
    return this.inputs.drawerButton.actionEvent
        .pipe(
            scan(acc => !acc, false),
            startWith(false),
        );
  }
}

import { elementWithTagType, instanceofType } from 'gs-types';
import { $drawer, $textIconButton, _p, Drawer, registerSvg, TextIconButton, ThemedCustomElementCtrl } from 'mask';
import { api, attributeIn, element, innerHtml, PersonaContext, stringParser } from 'persona';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap, withLatestFrom } from 'rxjs/operators';

import chevronDownSvg from '../asset/chevron_down.svg';
import chevronUpSvg from '../asset/chevron_up.svg';

import template from './doc-template.html';


export const $$ = {
  tag: 'pbd-doc-template',
  api: {
    label: attributeIn('label', stringParser(), ''),
  },
};

const $ = {
  drawer: element('drawer', elementWithTagType('mk-drawer'), api($drawer.api)),
  drawerIcon: element('drawerIcon', $textIconButton, {}),
  host: element($$.api),
  title: element('title', instanceofType(HTMLHeadingElement), {
    inner: innerHtml(),
  }),
};

@_p.customElement({
  ...$$,
  configure: vine => {
    registerSvg(vine, 'chevron_down', {type: 'embed', content: chevronDownSvg});
    registerSvg(vine, 'chevron_up', {type: 'embed', content: chevronUpSvg});
  },
  dependencies: [
    Drawer,
    TextIconButton,
  ],
  template,
})
export class DocTemplate extends ThemedCustomElementCtrl {
  private readonly drawerExpanded$ = new BehaviorSubject(false);
  private readonly label$ = this.declareInput($.host._.label);
  private readonly onDrawerIconClick$ = this.declareInput($.drawerIcon._.actionEvent);

  constructor(context: PersonaContext) {
    super(context);

    this.render($.drawer._.expanded, this.drawerExpanded$);
    this.render($.drawerIcon._.icon, this.renderDrawerIcon());
    this.render($.title._.inner, this.label$);
    this.addSetup(this.setupHandleDrawerIconClick());
  }

  private renderDrawerIcon(): Observable<string> {
    return this.drawerExpanded$.pipe(map(expanded => expanded ? 'chevron_down' : 'chevron_up'));
  }

  private setupHandleDrawerIconClick(): Observable<unknown> {
    return this.onDrawerIconClick$
        .pipe(
            withLatestFrom(this.drawerExpanded$),
            tap(([, expanded]) => this.drawerExpanded$.next(!expanded)),
        );
  }
}

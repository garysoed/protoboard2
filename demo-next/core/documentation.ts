import {cache} from 'gs-tools/export/data';
import {renderTheme} from 'mask';
import {Context, Ctrl, DIV, ocase, query, registerCustomElement, renderElement, RenderSpec} from 'persona';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {D1_DEMO} from '../piece/d1';
import {D2_DEMO} from '../piece/d2';
import {D6_DEMO} from '../piece/d6';

import template from './documentation.html';
import {INSTRUCTION} from './instruction';
import {$locationService} from './location-service';
import {getPageSpec, PageSpec} from './page-spec';


const $documentation = {
  shadow: {
    root: query('#root', DIV, {
      content: ocase<PageSpec|null>('#content'),
    }),
  },
};

export class Documentation implements Ctrl {
  constructor(private readonly $: Context<typeof $documentation>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      $locationService.get(this.$.vine).location$.pipe(map(location => getPageSpec(location.type))).pipe(
          this.$.shadow.root.content(spec => this.renderContent(spec)),
      ),
    ];
  }

  @cache()
  private renderContent(spec: PageSpec|null): RenderSpec|null {
    if (!spec) {
      return null;
    }

    return renderElement({spec: {}, registration: spec.registration});
  }
}

export const DOCUMENTATION = registerCustomElement({
  ctrl: Documentation,
  deps: [
    // CanvasDemo,
    D1_DEMO,
    D2_DEMO,
    D6_DEMO,
    // DeckDemo,
    INSTRUCTION,
    // SlotDemo,
  ],
  spec: $documentation,
  tag: 'pbd-documentation',
  template,
});
import {cache} from 'gs-tools/export/data';
import {renderTheme} from 'mask';
import {Context, Ctrl, DIV, ocase, query, registerCustomElement, renderElement, RenderSpec} from 'persona';
import {Observable, OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';


import template from './documentation.html';
import {$locationService} from './location-service';
import {ALL_SPECS, getPageSpec, PageSpec} from './page-spec';


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
          this.$.shadow.root.content(this.renderContent()),
      ),
    ];
  }

  private renderContent(): OperatorFunction<PageSpec|null, RenderSpec|null> {
    return map(spec => {
      if (!spec) {
        return null;
      }

      return renderElement({spec: {}, registration: spec.registration});
    });
  }
}

export const DOCUMENTATION = registerCustomElement({
  ctrl: Documentation,
  deps: ALL_SPECS.map(spec => spec.registration),
  spec: $documentation,
  tag: 'pbd-documentation',
  template,
});
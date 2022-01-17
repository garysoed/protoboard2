import {cache} from 'gs-tools/export/data';
import {renderTheme} from 'mask';
import {Context, Ctrl, DIV, id, osingle, registerCustomElement, renderCustomElement, RenderSpec} from 'persona';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import template from './documentation.html';
import {INSTRUCTION} from './instruction';
import {$locationService} from './location-service';
import {getPageSpec} from './page-spec';


const $documentation = {
  shadow: {
    root: id('root', DIV, {
      content: osingle('#content'),
    }),
  },
};

export class Documentation implements Ctrl {
  constructor(private readonly $: Context<typeof $documentation>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      this.content$.pipe(this.$.shadow.root.content()),
    ];
  }

  @cache()
  private get content$(): Observable<RenderSpec|null> {
    return $locationService.get(this.$.vine).location$
        .pipe(
            map(location => {
              const spec = getPageSpec(location.type);
              if (!spec) {
                return null;
              }

              return renderCustomElement({registration: spec.registration, inputs: {}, id: {}});
            }),
        );
  }
}

export const DOCUMENTATION = registerCustomElement({
  ctrl: Documentation,
  deps: [
    // CanvasDemo,
    // D1Demo,
    // D2Demo,
    // D6Demo,
    // DeckDemo,
    INSTRUCTION,
    // SlotDemo,
  ],
  spec: $documentation,
  tag: 'pbd-documentation',
  template,
});
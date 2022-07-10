import {cache} from 'gs-tools/export/data';
import {renderTheme} from 'mask';
import {Context, Ctrl, query, registerCustomElement} from 'persona';
import {Observable, of} from 'rxjs';

import {SURFACE} from '../../src-next/region/surface';
import {$state$} from '../demo-state';
import {DOCUMENTATION_TEMPLATE} from '../template/documentation-template';

import template from './surface.html';


export const surfaceDemo = {
  shadow: {
    surface: query('#surface', SURFACE),
  },
};

class SurfaceDemo implements Ctrl {
  private readonly state$ = $state$.get(this.$.vine)._('surface');

  constructor(private readonly $: Context<typeof surfaceDemo>) { }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      of(this.state$._('surface')).pipe(this.$.shadow.surface.state()),
    ];
  }
}

export const SURFACE_DEMO = registerCustomElement({
  ctrl: SurfaceDemo,
  deps: [
    DOCUMENTATION_TEMPLATE,
    SURFACE,
  ],
  spec: surfaceDemo,
  tag: 'pbd-surface',
  template,
});
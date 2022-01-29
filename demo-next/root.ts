import {cache} from 'gs-tools/export/data';
import {OVERLAY, renderTheme, ROOT_LAYOUT} from 'mask';
import {Context, Ctrl, id, registerCustomElement} from 'persona';
import {Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import {ACTIVE} from '../src-next/core/active';
import {SLOT} from '../src-next/region/slot';

import {DOCUMENTATION} from './core/documentation';
import {DRAWER} from './core/drawer';
import {$locationService, Views} from './core/location-service';
import template from './root.html';


const $root = {
  shadow: {
    active: id('active', ACTIVE),
    drawer: id('drawer', DRAWER),
    root: id('root', ROOT_LAYOUT),
  },
};


export class Root implements Ctrl {
  constructor(private readonly $: Context<typeof $root>) {
  }

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      renderTheme(this.$),
      this.$.shadow.root.drawerExpanded.pipe(
          map(expanded => expanded ?? false),
          this.$.shadow.drawer.drawerExpanded(),
      ),
      this.$.shadow.root.onTitleClick.pipe(
          tap(() => {
            $locationService.get(this.$.vine).goToPath(Views.INSTRUCTION, {});
          }),
      ),
    ];
  }
}

export const ROOT = registerCustomElement({
  ctrl: Root,
  deps: [
    ACTIVE,
    DOCUMENTATION,
    DRAWER,
    OVERLAY,
    ROOT_LAYOUT,
    SLOT,
    // HelpOverlay,
    // LensDisplay,
  ],
  spec: $root,
  tag: 'pbd-root',
  template,
});
import {cache} from 'gs-tools/export/data';
import {OVERLAY, renderTheme, ROOT_LAYOUT} from 'mask';
import {Context, Ctrl, query, registerCustomElement} from 'persona';
import {Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import {HELP_OVERLAY} from '../src-next/action/help-overlay';
import {ACTIVE} from '../src-next/core/active';
import {LENS} from '../src-next/face/lens';
import {LENS_DISPLAY} from '../src-next/face/lens-display';
import {D1} from '../src-next/piece/d1';
import {SURFACE} from '../src-next/region/surface';

import {DOCUMENTATION} from './core/documentation';
import {DRAWER} from './core/drawer';
import {$locationService, Views} from './core/location-service';
import {RENDERED_FACE} from './piece/rendered-face';
import template from './root.html';


const $root = {
  shadow: {
    active: query('#active', ACTIVE),
    drawer: query('#drawer', DRAWER),
    root: query('#root', ROOT_LAYOUT),
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
    D1,
    DOCUMENTATION,
    DRAWER,
    HELP_OVERLAY,
    LENS,
    LENS_DISPLAY,
    OVERLAY,
    RENDERED_FACE,
    ROOT_LAYOUT,
    SURFACE,
  ],
  spec: $root,
  tag: 'pbd-root',
  template,
});
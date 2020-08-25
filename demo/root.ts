import { cache } from 'gs-tools/export/data';
import { elementWithTagType } from 'gs-types';
import { $rootLayout, _p, RootLayout, ThemedCustomElementCtrl } from 'mask';
import { api, element, PersonaContext } from 'persona';
import { Observable } from 'rxjs';
import { tap, withLatestFrom } from 'rxjs/operators';

import { Active } from '../src/region/active';

import { Documentation } from './core/documentation';
import { $drawer, Drawer } from './core/drawer';
import { $locationService, Views } from './core/location-service';
import { PlayArea } from './core/play-area';
import { initializeState } from './core/state';
import template from './root.html';


// import { HelpOverlay } from '../src-old/action/help-overlay';


const $ = {
  drawer: element('drawer', $drawer, {}),
  root: element('root', elementWithTagType('mk-root-layout'), api($rootLayout.api)),
};

@_p.customElement({
  dependencies: [
    Active,
    Documentation,
    Drawer,
    // HelpOverlay,
    PlayArea,
    RootLayout,
  ],
  tag: 'pbd-root',
  template,
  api: {},
  configure: vine => {
    initializeState(vine);
  },
})
export class Root extends ThemedCustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);
    this.addSetup(this.handleOnRootActive$);
    this.render($.drawer._.drawerExpanded, this.declareInput($.root._.drawerExpanded));
  }

  @cache()
  private get handleOnRootActive$(): Observable<unknown> {
    return this.declareInput($.root._.onTitleClick)
        .pipe(
            withLatestFrom($locationService.get(this.vine)),
            tap(([, service]) => {
              service.goToPath(Views.INSTRUCTION, {});
            }),
        );
  }
}

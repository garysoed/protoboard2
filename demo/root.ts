import { elementWithTagType } from 'gs-types';
import { $rootLayout, _p, RootLayout, ThemedCustomElementCtrl } from 'mask';
import { api, element, PersonaContext } from 'persona';
import { Observable } from 'rxjs';
import { tap, withLatestFrom } from 'rxjs/operators';

import { HelpOverlay } from '../src/action/help-overlay';
import { PickHand } from '../src/action/pick-hand';

import { Doc } from './core/doc';
import { $$ as $drawer, Drawer } from './core/drawer';
import { $locationService, Views } from './location-service';
import { PlayArea } from './play/play-area';
import template from './root.html';


const $ = {
  drawer: element('drawer', elementWithTagType('pbd-drawer'), api($drawer.api)),
  root: element('root', elementWithTagType('mk-root-layout'), api($rootLayout.api)),
};

@_p.customElement({
  dependencies: [
    Doc,
    Drawer,
    HelpOverlay,
    PickHand,
    PlayArea,
    RootLayout,
  ],
  tag: 'pbd-root',
  template,
  api: {},
})
export class Root extends ThemedCustomElementCtrl {
  private readonly locationService$ = $locationService.get(this.vine);
  private readonly onRootActive$ = this.declareInput($.root._.onTitleClick);
  private readonly rootDrawerExpanded$ = this.declareInput($.root._.drawerExpanded);

  constructor(context: PersonaContext) {
    super(context);
    this.addSetup(this.setupHandleOnRootActive());
    this.render($.drawer._.drawerExpanded, this.rootDrawerExpanded$);
  }

  private setupHandleOnRootActive(): Observable<unknown> {
    return this.onRootActive$
        .pipe(
            withLatestFrom(this.locationService$),
            tap(([, service]) => {
              service.goToPath(Views.INSTRUCTION, {});
            }),
        );
  }
}

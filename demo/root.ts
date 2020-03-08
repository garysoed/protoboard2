import { Vine } from 'grapevine';
import { ElementWithTagType } from 'gs-types';
import { $rootLayout, _p, RootLayout, ThemedCustomElementCtrl } from 'mask';
import { api, element } from 'persona';
import { switchMap, takeUntil, withLatestFrom } from 'rxjs/operators';

import { HelpOverlay } from '../src/action/help-overlay';
import { PickHand } from '../src/action/pick-hand';

import { Doc } from './core/doc';
import { $$ as $drawer, Drawer } from './core/drawer';
import { FreeLayout } from './layout/free-layout';
import { GridLayout } from './layout/grid-layout';
import { $locationService } from './location-service';
import { PlayArea } from './play/play-area';
import template from './root.html';


const $ = {
  drawer: element('drawer', ElementWithTagType('pbd-drawer'), api($drawer.api)),
  root: element('root', ElementWithTagType('mk-root-layout'), api($rootLayout.api)),
};

@_p.customElement({
  dependencies: [
    Doc,
    Drawer,
    GridLayout,
    HelpOverlay,
    FreeLayout,
    PickHand,
    PlayArea,
    RootLayout,
  ],
  tag: 'pbd-root',
  template,
})
export class Root extends ThemedCustomElementCtrl {
  private readonly locationService$ = $locationService.get(this.vine);
  private readonly onRootActive$ = this.declareInput($.root._.onTitleClick);
  private readonly rootDrawerExpanded$ = this.declareInput($.root._.drawerExpanded);

  constructor(shadowRoot: ShadowRoot, vine: Vine) {
    super(shadowRoot, vine);
    this.setupHandleOnRootActive();
    this.render($.drawer._.drawerExpanded).withObservable(this.rootDrawerExpanded$);
  }

  private setupHandleOnRootActive(): void {
    this.onRootActive$
        .pipe(
            withLatestFrom(this.locationService$),
            switchMap(([, service]) => service.goToPath('INSTRUCTION', {})),
            takeUntil(this.onDispose$),
        )
        .subscribe();
  }
}

import { ElementWithTagType } from '@gs-types';
import { $rootLayout, _p, _v, RootLayout, ThemedCustomElementCtrl } from '@mask';
import { api, element, InitFn } from '@persona';
import { switchMap, withLatestFrom } from '@rxjs/operators';

import { PickHand } from '../src/action/pick-hand';

import { Doc } from './doc/doc';
import { $$ as $drawer, Drawer } from './drawer/drawer';
import { $locationService } from './location-service';
import { PlayArea } from './play/play-area';
import template from './root.html';

const $ = {
  drawer: element('drawer', ElementWithTagType('pbd-drawer'), api($drawer)),
  root: element('root', ElementWithTagType('mk-root-layout'), api($rootLayout)),
};

@_p.customElement({
  dependencies: [
    Doc,
    Drawer,
    PickHand,
    PlayArea,
    RootLayout,
  ],
  tag: 'pbd-root',
  template,
})
export class Root extends ThemedCustomElementCtrl {
  private readonly locationService$ = $locationService.asSubject();
  private readonly onRootActive$ = _p.input($.root._.onTitleClick, this);
  private readonly rootDrawerExpanded$ = _p.input($.root._.drawerExpanded, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      this.setupHandleOnRootActive(),
      _p.render($.drawer._.drawerExpanded).withObservable(this.rootDrawerExpanded$),
    ];
  }

  private setupHandleOnRootActive(): InitFn {
    return () => this.onRootActive$
        .pipe(
            withLatestFrom(this.locationService$),
            switchMap(([, service]) => service.goToPath('INSTRUCTION', {})),
        );
  }
}

import { ElementWithTagType } from '@gs-types';
import { $rootLayout, _p, _v, RootLayout, ThemedCustomElementCtrl } from '@mask';
import { api, element, InitFn } from '@persona';
import { switchMap, withLatestFrom } from '@rxjs/operators';
import { PickHand } from '../src/action/pick-hand';
import { Doc } from './doc/doc';
import { Drawer } from './drawer/drawer';
import { $locationService } from './location-service';
import template from './root.html';

const $ = {
  root: element('root', ElementWithTagType('mk-root-layout'), api($rootLayout)),
};

@_p.customElement({
  dependencies: [
    Doc,
    Drawer,
    PickHand,
    RootLayout,
  ],
  tag: 'pbd-root',
  template,
})
export class Root extends ThemedCustomElementCtrl {
  private readonly locationService$ = $locationService.asSubject();
  private readonly onRootActive$ = _p.input($.root._.onTitleClick, this);

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      this.setupHandleOnRootActive(),
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

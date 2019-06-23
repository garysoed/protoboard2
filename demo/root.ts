import { _p, RootLayout, ThemedCustomElementCtrl } from '@mask';
import { PickHand } from '../src/action/pick-hand';
import { Doc } from './doc/doc';
import { Drawer } from './drawer/drawer';
import template from './root.html';

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

}

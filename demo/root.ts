import { _p, RootLayout, ThemedCustomElementCtrl } from '@mask';
import { Doc } from './doc/doc';
import template from './root.html';

@_p.customElement({
  dependencies: [
    Doc,
    RootLayout,
  ],
  tag: 'pbd-root',
  template,
})
export class Root extends ThemedCustomElementCtrl {

}

import { _p, RootLayout, ThemedCustomElementCtrl } from '@mask';
import template from './root.html';

@_p.customElement({
  dependencies: [
    RootLayout,
  ],
  tag: 'pbd-root',
  template,
})
export class Root extends ThemedCustomElementCtrl {

}

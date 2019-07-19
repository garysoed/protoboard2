import { _p, ThemedCustomElementCtrl } from '@mask';

import template from './layout-free.html';
import { LayoutTemplate } from './layout-template';

@_p.customElement({
  dependencies: [
    LayoutTemplate,
  ],
  tag: 'pbd-layout-free',
  template,
})
export class LayoutFree extends ThemedCustomElementCtrl {

}

import { _p, ThemedCustomElementCtrl } from '@mask';

import { GridLayout as GridLayoutImpl } from '../../src/layout/grid-layout';

import template from './grid-layout.html';
import { LayoutTemplate } from './layout-template';

@_p.customElement({
  dependencies: [
    GridLayoutImpl,
    LayoutTemplate,
  ],
  tag: 'pbd-grid-layout',
  template,
})
export class GridLayout extends ThemedCustomElementCtrl {

}

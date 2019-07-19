import { Vine } from '@grapevine';
import { $svgConfig, _p, TextIconButton, ThemedCustomElementCtrl } from '@mask';

import addSvg from '../asset/add.svg';

import { DocTemplate } from './doc-template';
import template from './layout-template.html';

@_p.customElement({
  dependencies: [
    DocTemplate,
    TextIconButton,
  ],
  tag: 'pbd-layout-template',
  template,
  configure(vine: Vine): void {
    $svgConfig.get(vine).next({
      key: 'add',
      type: 'set',
      value: {type: 'embed', content: addSvg},
    });
  },
})
export class LayoutTemplate extends ThemedCustomElementCtrl {

}

import { _p, ThemedCustomElementCtrl } from '@mask';

import template from './component-template.html';
import { DocTemplate } from './doc-template';

@_p.customElement({
  dependencies: [
    DocTemplate,
  ],
  tag: 'pbd-component-template',
  template,
})
export class ComponentTemplate extends ThemedCustomElementCtrl {

}

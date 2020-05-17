import { _p, ThemedCustomElementCtrl } from 'mask';

import template from './play-default.html';

@_p.customElement({
  tag: 'pbd-play-default',
  api: {},
  template,
})
export class PlayDefault extends ThemedCustomElementCtrl { }

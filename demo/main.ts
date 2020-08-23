import { Palette, registerSvg, start, Theme } from 'mask';

import protoboardSvg from './asset/icon.svg';
import { Root } from './root';

const iconConfigs: Map<string, string> = new Map([
  ['protoboard', protoboardSvg],
]);

window.addEventListener('load', () => {
  const theme = new Theme(document, Palette.GREY, Palette.YELLOW);
  const {vine} = start(
      'protoboard',
      [Root],
      document,
      theme,
      document.getElementById('globalStyle') as HTMLStyleElement,
  );

  for (const [key, content] of iconConfigs) {
    registerSvg(vine, key, {type: 'embed', content});
  }
});

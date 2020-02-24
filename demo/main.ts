import { $svgConfig, Palette, start, Theme } from 'mask';

import protoboardSvg from './asset/icon.svg';
import { Root } from './root';

const iconConfigs: Map<string, string> = new Map([
  ['protoboard', protoboardSvg],
]);

window.addEventListener('load', () => {
  const theme = new Theme(Palette.GREY, Palette.YELLOW);
  const {vine} = start(
      'protoboard',
      [Root],
      theme,
      document.getElementById('globalStyle') as HTMLStyleElement,
  );

  const svgMap$ = $svgConfig.get(vine);
  for (const [key, content] of iconConfigs) {
    svgMap$.next({type: 'set', key, value: {type: 'embed', content}});
  }
});

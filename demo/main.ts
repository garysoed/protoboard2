import { $svgConfig, Palette, start, Theme } from 'mask';
import { switchMap } from 'rxjs/operators';

import protoboardSvg from './asset/icon.svg';
import { $locationService } from './location-service';
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

  const svgMap$ = $svgConfig.get(vine);
  for (const [key, content] of iconConfigs) {
    svgMap$.next({type: 'set', key, value: {type: 'embed', content}});
  }

  $locationService.get(vine)
      .pipe(switchMap(locationService => locationService.run()))
      .subscribe();
});

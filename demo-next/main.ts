import {registerSvg, start, UrlThemeLoader} from 'mask';
import {renderTextNode} from 'persona';
import {ON_LOG_$, WebConsoleDestination} from 'santa';

import {$getRenderSpec$} from '../src-next/render/render-component-spec';

import protoboardSvg from './asset/icon.svg';
import {$locationService} from './core/location-service';
import {ROOT} from './root';


const iconConfigs: Map<string, string> = new Map([
  ['protoboard', protoboardSvg],
]);

const webConsoleDestination = new WebConsoleDestination({installTrigger: true});
ON_LOG_$.subscribe(log => {
  webConsoleDestination.log(log);
});

window.addEventListener('load', () => {
  const {vine} = start(
      'protoboard',
      [ROOT],
      document,
      new UrlThemeLoader('theme.css'),
  );

  for (const [key, content] of iconConfigs) {
    registerSvg(vine, key, {type: 'embed', content});
  }

  $getRenderSpec$.get(vine).next(() => renderTextNode({id: {}, textContent: 'TODO'}));

  $locationService.get(vine).run().subscribe();
});


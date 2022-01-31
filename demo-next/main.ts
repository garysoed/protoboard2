import {registerSvg, start, UrlThemeLoader} from 'mask';
import {ON_LOG_$, WebConsoleDestination} from 'santa';

import {registerComponentRenderSpec} from '../src-next/renderspec/render-component-spec';
import {registerFaceRenderSpec} from '../src-next/renderspec/render-face-spec';

import protoboardSvg from './asset/icon.svg';
import {$locationService} from './core/location-service';
import {renderComponent, renderFace} from './demo-state';
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

  registerFaceRenderSpec(vine, id => renderFace(id));
  registerComponentRenderSpec(vine, id => renderComponent(id, vine));
  $locationService.get(vine).run().subscribe();
});


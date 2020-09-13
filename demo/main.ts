import { filterNonNull } from 'gs-tools/export/rxjs';
import { PALETTE, registerSvg, start, Theme, $stateService } from 'mask';
import { switchMap, take, withLatestFrom } from 'rxjs/operators';
import { ON_LOG_$, WebConsoleDestination } from 'santa';

import protoboardSvg from './asset/icon.svg';
import { $locationService } from './core/location-service';
import { $saveService } from './core/save-service';
import { $stagingService } from './core/staging-service';
import { Root } from './root';


const iconConfigs: Map<string, string> = new Map([
  ['protoboard', protoboardSvg],
]);

const webConsoleDestination = new WebConsoleDestination({installTrigger: true});
ON_LOG_$.subscribe(log => {
  webConsoleDestination.log(log);
});

window.addEventListener('load', () => {
  const theme = new Theme(document, PALETTE.GREY, PALETTE.LIME);
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

  $locationService.get(vine)
      .pipe(switchMap(locationService => locationService.run()))
      .subscribe();

  $saveService.get(vine)
      .pipe(switchMap(saveService => saveService.run()))
      .subscribe();

  $saveService.get(vine)
      .pipe(
          switchMap(service => service.savedState$),
          take(1),
          filterNonNull(),
          withLatestFrom($stateService.get(vine), $stagingService.get(vine)),
      )
      .subscribe(([state, stateService, stagingService]) => {
        stateService.init(state);
        stagingService.setStaging(false);
      });
});

import { PALETTE, registerSvg, start, Theme } from 'mask';
import { renderCustomElement } from 'persona';
import { of as observableOf } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ON_LOG_$, WebConsoleDestination } from 'santa';

import { registerObjectCreateSpec } from '../src/objects/object-service';
import { $slot, SlotPayload } from '../src/region/slot';

import protoboardSvg from './asset/icon.svg';
import { $locationService } from './core/location-service';
import { $saveService } from './core/save-service';
import { SUPPLY_TYPE } from './core/supply';
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

  registerObjectCreateSpec<SlotPayload>(
      SUPPLY_TYPE,
      (state, context) => {
        return renderCustomElement(
            $slot,
            {inputs: {objectId: observableOf(state.id)}},
            context,
        );
      },
      vine,
  );

      // TODO
  // $saveService.get(vine)
  //     .pipe(
  //         switchMap(service => service.savedState$),
  //         take(1),
  //         filterNonNull(),
  //         withLatestFrom($stateService.get(vine), $stagingService.get(vine)),
  //     )
  //     .subscribe(([state, stateService, stagingService]) => {
  //       stateService.init(state);
  //       stagingService.setStaging(false);
  //     });
});

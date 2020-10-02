import { filterNonNull } from 'gs-tools/export/rxjs';
import { Snapshot, StateId } from 'gs-tools/export/state';
import { LocalStorage } from 'gs-tools/export/store';
import { $saveConfig, $saveService, $stateService, PALETTE, registerSvg, start, Theme } from 'mask';
import { identity, json } from 'nabu';
import { switchMap, take, withLatestFrom } from 'rxjs/operators';
import { ON_LOG_$, WebConsoleDestination } from 'santa';

import { $createSpecMap } from '../src/objects/object-service';
import { $objectSpecListId, HasObjectSpecList } from '../src/objects/object-spec-list';
import { ACTIVE_TYPE, renderActive } from '../src/region/active';

import protoboardSvg from './asset/icon.svg';
import { $locationService } from './core/location-service';
import { PREVIEW_TYPE, renderDemoPreview, renderRootSlot, renderSupply, ROOT_SLOT_TYPE, SUPPLY_TYPE } from './core/object-specs';
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

  const storage = new LocalStorage<Snapshot<any>>(
      window,
      'pbd',
      // TODO: Make this easier.
      identity() as any,
      json(),
  );
  $saveConfig.set(vine, () => ({
    loadOnInit: true,
    saveId: 'save',
    storage,
    initFn: stateService => stateService.add<HasObjectSpecList>({objectSpecs: []}),
  }));

  $saveService.get(vine)
      .pipe(
          switchMap(service => service.savedState$),
          filterNonNull(),
          withLatestFrom($stateService.get(vine), $stagingService.get(vine)),
          take(1),
      )
      .subscribe(([state, stateService, stagingService]) => {
        stateService.init(state);
        $objectSpecListId.set(vine, () => state.rootId as StateId<HasObjectSpecList>);
        stagingService.setStaging(false);
      });

  $createSpecMap.set(vine, () => new Map([
    [ACTIVE_TYPE, renderActive],
    [ROOT_SLOT_TYPE, renderRootSlot],
    [SUPPLY_TYPE, renderSupply],
    [PREVIEW_TYPE, renderDemoPreview],
  ]));
});

import { filterNonNull } from 'gs-tools/export/rxjs';
import { Snapshot, StateId, StateService } from 'gs-tools/export/state';
import { LocalStorage } from 'gs-tools/export/store';
import { $saveConfig, $saveService, $stateService, PALETTE, registerSvg, start, Theme } from 'mask';
import { identity, json } from 'nabu';
import { switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { ON_LOG_$, WebConsoleDestination } from 'santa';

import { ACTIVE_TYPE, renderActive } from '../src/core/active';
import { ObjectCreateSpec } from '../src/objects/object-create-spec';
import { $createSpecMap } from '../src/objects/object-service';
import { $objectSpecListId } from '../src/objects/object-spec-list';

import protoboardSvg from './asset/icon.svg';
import { $locationService } from './core/location-service';
import { PREVIEW_TYPE, renderDemoPreview, renderRootSlot, renderSupply, ROOT_SLOT_TYPE, SUPPLY_TYPE } from './core/object-specs';
import { Root } from './root';
import { PieceTypes } from './state/editor-state';
import { $demoState } from './state/getters/demo-state';
import { DemoState } from './state/types/demo-state';
import { PieceSpec } from './state/types/piece-spec';
import { FACE_ICONS } from './state/types/piece-state';
import { PlayState } from './state/types/play-state';


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

  const storage = new LocalStorage<Snapshot<any>>(
      window,
      'pbd',
      // TODO: Make this easier.
      identity() as any,
      json(),
  );

  $saveService.get(vine)
      .pipe(
          tap(saveService => {
            saveService.setSaving(true);
          }),
          switchMap(saveService => saveService.run()),
      )
      .subscribe();
  $saveConfig.set(vine, () => ({
    loadOnInit: true,
    saveId: 'save',
    storage,
    initFn: init,
  }));

  $demoState.get(vine).subscribe(demoState => {
    $objectSpecListId.set(vine, () => demoState?.$playState ?? null);
  });

  $createSpecMap.set(vine, () => new Map<string, ObjectCreateSpec<any>>([
    [ACTIVE_TYPE, renderActive],
    [ROOT_SLOT_TYPE, renderRootSlot],
    [SUPPLY_TYPE, renderSupply],
    [PREVIEW_TYPE, renderDemoPreview],
  ]));
});

function init(stateService: StateService): StateId<DemoState> {
  return stateService.add<DemoState>({
    $isStaging: stateService.add(true),
    $playState: stateService.add<PlayState>({objectSpecs: []}),
    editorState: {
      [PieceTypes.D1]: {
        length: 1,
        $editedFace: stateService.add<number>(0),
        $faceIcons: stateService.add<readonly string[]>(FACE_ICONS.slice(0, 1)),
      },
      [PieceTypes.D2]: {
        length: 2,
        $editedFace: stateService.add<number>(0),
        $faceIcons: stateService.add<readonly string[]>(FACE_ICONS.slice(0, 2)),
      },
      [PieceTypes.D6]: {
        length: 6,
        $editedFace: stateService.add<number>(0),
        $faceIcons: stateService.add<readonly string[]>([...FACE_ICONS, ...FACE_ICONS.slice(0, 2)]),
      },
    },
    stagingState: {
      $pieceSpecs: stateService.add<readonly PieceSpec[]>([]),
    },
  });
}

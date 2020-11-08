import { $saveConfig, $saveService, PALETTE, Theme, registerSvg, start } from 'mask';
import { LocalStorage } from 'gs-tools/export/store';
import { ON_LOG_$, WebConsoleDestination } from 'santa';
import { Snapshot, StateId, StateService } from 'gs-tools/export/state';
import { identity, json } from 'nabu';
import { switchMap, tap } from 'rxjs/operators';

import { $$rootState } from '../src/objects/root-state';
import { $createSpecMap } from '../src/objects/object-service';
import { ACTIVE_TYPE, renderActive } from '../src/core/active';
import { ObjectCreateSpec } from '../src/objects/object-create-spec';

import { $demoState } from './state/getters/demo-state';
import { $locationService } from './core/location-service';
import { DemoState } from './state/types/demo-state';
import { FACE_ICONS } from './state/types/piece-state';
import { PIECE_TYPE, REGION_TYPE, ROOT_SLOT_TYPE, SUPPLY_TYPE, renderDemoPiece, renderDemoRegion, renderRootSlot, renderSupply } from './core/object-specs';
import { PieceSpec } from './state/types/piece-spec';
import { PieceType } from './state/types/piece-type';
import { PlayState } from './state/types/play-state';
import { RegionSpec } from './state/types/region-spec';
import { RegionType } from './state/types/region-type';
import { Root } from './root';
import protoboardSvg from './asset/icon.svg';


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

  const storage = new LocalStorage<Snapshot<DemoState>, any>(
      window,
      'pbd',
      identity(),
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
    $$rootState.set(vine, () => demoState?.$playState ?? null);
  });

  $createSpecMap.set(vine, () => new Map<string, ObjectCreateSpec<any>>([
    [ACTIVE_TYPE, renderActive],
    [ROOT_SLOT_TYPE, renderRootSlot],
    [SUPPLY_TYPE, renderSupply],
    [PIECE_TYPE, renderDemoPiece],
    [REGION_TYPE, renderDemoRegion],
  ]));
});

function init(stateService: StateService): StateId<DemoState> {
  return stateService.add<DemoState>({
    $isStaging: stateService.add(true),
    $playState: stateService.add<PlayState>({
      $activeId: stateService.add({
        id: 'ACTIVE_ID',
        type: ACTIVE_TYPE,
        payload: {
          containerType: 'indexed',
          $contentSpecs: stateService.add([]),
        },
      }),
      objectSpecs: [],
    }),
    pieceEditorState: {
      [PieceType.D1]: {
        length: 1,
        $editedFace: stateService.add<number>(0),
        $faceIcons: stateService.add<readonly string[]>(FACE_ICONS.slice(0, 1)),
      },
      [PieceType.D2]: {
        length: 2,
        $editedFace: stateService.add<number>(0),
        $faceIcons: stateService.add<readonly string[]>(FACE_ICONS.slice(0, 2)),
      },
      [PieceType.D6]: {
        length: 6,
        $editedFace: stateService.add<number>(0),
        $faceIcons: stateService.add<readonly string[]>([...FACE_ICONS, ...FACE_ICONS.slice(0, 2)]),
      },
    },
    regionEditorState: {
      [RegionType.DECK]: {
        $targetArea: stateService.add(0),
      },
    },
    stagingState: {
      $pieceSpecs: stateService.add<readonly PieceSpec[]>([]),
      $regionSpecs: stateService.add<readonly RegionSpec[]>([]),
    },
  });
}
